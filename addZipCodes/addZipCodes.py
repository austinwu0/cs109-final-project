def addZipCodes(importdirectory,exportdirectory) :

    """Assigns relevant zip codes to data that is coded at the county level only.

    Parameters:
    -----------
    importdirectory : .csv directory of df to convert (counties only)
    exportdirectory : .csv directory of converted df (with zip codes) 

    Returns:
    --------
    True : if successful

    """
    
    import json
    import csv
    import numpy as np
    import pandas as pd

    zipCodesDirectory=pd.read_csv('addZipCodes/zip_code_database.csv', low_memory=False)
    zipCodesDirectory=zipCodesDirectory[['zip','county','state']]

    toConvert=pd.read_csv(importdirectory, low_memory=False)
    
    countyNames=[county.split(', ')[0] for county in toConvert['GEO.display-label']]
    stateNames=[county.split(', ')[-1] for county in toConvert['GEO.display-label']]
    
    with open('addZipCodes/states-abbrev.json', 'r') as fp:
        statesAbbrev = json.load(fp)
        
    abbrevStateNames = [statesAbbrev[state] if state in statesAbbrev.keys() else '' for state in stateNames]
    toConvert['county']=countyNames
    toConvert['state']=abbrevStateNames

    DBwithzips = pd.merge(toConvert, zipCodesDirectory, on=['county','state'])
    DBwithzips['zip'] = DBwithzips['zip'].astype(str)

    DBwithzips.to_csv(exportdirectory)
    
    return True