def addZipCodes(importdirectory,exportdirectory) :
    
    import json
    import csv
    import numpy as np
    import pandas as pd

    zipCodesDirectory=pd.read_csv('zip_code_database.csv', low_memory=False)
    zipCodesDirectory=zipCodesDirectory[['zip','county','state']]

    toConvert=pd.read_csv(importdirectory, low_memory=False)
    
    countyNames=[county.split(', ')[0] for county in toConvert['GEO.display-label']]
    stateNames=[county.split(', ')[-1] for county in toConvert['GEO.display-label']]
    
    with open('states-abbrev.json', 'r') as fp:
        statesAbbrev = json.load(fp)
        
    abbrevStateNames = [statesAbbrev[state] if state in statesAbbrev.keys() else '' for state in stateNames]
    toConvert['county']=countyNames
    toConvert['state']=abbrevStateNames

    DBwithzips = pd.merge(sample, zipCodesDirectory, on=['county','state'])
    DBwithzips.to_csv(exportdirectory)
    
    return True