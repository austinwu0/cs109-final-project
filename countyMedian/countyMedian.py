def countyMedian(pkl, col) :

    import numpy as np
    import json
    import pandas as pd
    test = pd.read_pickle(pkl)
    test['zip'] = test['zip'].astype(str)

    #processing zip codes
    lst=[]
    for i in test["zip"]:
        if len(str(i))!=5:
            lst.append("0"+str(i))
        else:
            lst.append(str(i))

    newcountyCodes=pd.read_csv('countyMedian/zip_to_county.csv', dtype={'ZCTA5': object, "GEOID" : object})
    newcountyCodes = newcountyCodes.rename(columns={'ZCTA5': 'zip'})
    newcountyCodes['zip'] = newcountyCodes['zip'].astype(str)

    db = pd.merge(test, newcountyCodes, on='zip')

    def agg_metric(metric):
        gb = db[[metric, "GEOID"]].groupby("GEOID")
        medians = gb.agg([np.median])
        medians.head()

        #processing into json format
        lst = []
        for i in medians.iterrows():
            dct = {}
            dct["id"] = i[0]
            if np.isnan(i[1][0]):
                dct["value"] = None
            else:
                dct["value"] = i[1][0]
            lst.append(dct)

        for i in lst:
            if i["id"][0] == "0":
                i["id"] = i["id"][1:]

        import json
        fd=open("data/"+metric+".json","w")
        json.dump(lst, fd)
        fd.close()

        return medians, lst

    medians, lst = agg_metric(col)

    med_list = []
    for i in medians.iterrows():
        if np.isnan(i[1][0]):
            med_list.append(np.nan)
        else:
            med_list.append(i[1][0])

    s=pd.Series(med_list)

    #get 2011 house price data
    lst = []
    for i in medians.iterrows():
        dct = {}
        dct["id"] = i[0]
        if np.isnan(i[1][0]):
            dct["value"] = None
        else:
            dct["value"] = i[1][0]
        lst.append(dct)

    import json
    fd=open("countyMedian/houses_2011_3.json","w")
    json.dump(lst, fd)
    fd.close()

    countyCodes=pd.read_csv('countyMedian/US_FIPS_Codes.csv')
    i = countyCodes[["FIPS State", "FIPS County"]]
    FIPs = []
    for row in i.iterrows():
        FIPs.append(('%02d' % row[1][0]) + ('%03d' % row[1][1]))
    countyCodes["FIP_Code"] = FIPs

    county_srted = db.sort('STATE')
    county_srted.head()

    new_db = pd.merge(db, newcountyCodes, on=['zip','GEOID','STATE','COUNTY'])
    gb = new_db.groupby("GEOID")
    new = gb.agg([np.median])

    return new[col].dropna()