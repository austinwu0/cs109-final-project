def countyMedian(pkl, col) :

    import numpy as np
    import json
    import pandas as pd
    test = pd.read_pickle(pkl)
    test['zip'] = test['zip'].astype(str)

    #processing zip codes
    lst=[]
    for i in test["zip"]:
        #print i
        if len(str(i))!=5:
            lst.append("0"+str(i))
        else:
            lst.append(str(i))

    test["zip"] = lst
    newcountyCodes=pd.read_csv('countyMedian/zip_to_county.csv', dtype={'ZCTA5': object, "GEOID" : object})
    newcountyCodes = newcountyCodes.rename(columns={'ZCTA5': 'zip'})
    newcountyCodes['zip'] = newcountyCodes['zip'].astype(str)
    mapcountyCodes=pd.read_csv('countyMedian/US_FIPS_Codes.csv', dtype={'FIPS State': object, "FIPS County" : object})
    mapcountyCodes["GEOID"] = mapcountyCodes["FIPS State"] + mapcountyCodes["FIPS County"]
 
    db_tmp = pd.merge(test, newcountyCodes, on='zip')
    db = pd.merge(db_tmp, mapcountyCodes[["State", "County Name", "GEOID"]], on="GEOID")

    #adding state abbreviations
    with open('addZipCodes/states-abbrev.json') as data_file:
        data = json.loads(data_file.read())
    
    state_lst = []
    for i in db.iterrows():
        state_lst.append(data[i[1]["State"]])
    db["State_Abbrev"] = state_lst
        
    def agg_metric(metric):
        gb = db[[metric, "GEOID", "County Name", "State_Abbrev", "State"]].groupby(["GEOID", "County Name", "State_Abbrev", "State"])
        medians = gb.agg([np.median])

        #processing into json format
        lst = []
        for i in medians.iterrows():
            dct = {}
            dct["id"] = i[0][0]
            dct["state_name"] = i[0][3]
            dct["state_id"] = i[0][2]
            dct["county"] = i[0][1]
            if np.isnan(i[1][0]):
                dct["value"] = None
            else:
                dct["value"] = i[1][0]
            lst.append(dct)

        for i in lst:
            if i["id"][0] == "0":
                i["id"] = i["id"][1:]

        import json
        fd=open("website/data/"+metric+"_new.json","w")
        json.dump(lst, fd)
        fd.close()

        return medians, lst

    medians, new_lst = agg_metric(col)

    return db, new_lst