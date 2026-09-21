"""Extract simultaneous NOAA observations, retaining their original timestamps."""
import gzip,json,hashlib
from pathlib import Path
root=Path(__file__).parent/'data'
p=root/'46005h2024.txt.gz'
rows=[]
for line in gzip.open(p,'rt'):
 if line.startswith('#'): continue
 a=line.split()
 try:
  h,t,w,gust=map(float,(a[8],a[9],a[6],a[7]))
  if not (0<=h<30 and 1<t<30 and 0<=w<90): continue
  rows.append(dict(time=f'{a[0]}-{a[1]}-{a[2]}T{a[3]}:{a[4]}:00Z',H=h,T=t,wind=w,gust=gust if gust<90 else None))
 except (ValueError,IndexError): pass
ordered=sorted(rows,key=lambda x:x['H'])
presets=[]
for q in [0,.05,.25,.5,.75,.9,.97,.995,1]:
 r=dict(ordered[round(q*(len(ordered)-1))]);r['label']=f'Observed {q*100:g}th percentile by wave height';r['kind']='observed';presets.append(r)
result=dict(station='46005',year=2024,url='https://www.ndbc.noaa.gov/data/historical/stdmet/46005h2024.txt.gz',sha256=hashlib.sha256(p.read_bytes()).hexdigest(),validRows=len(rows),presets=presets,notes='Simultaneous valid WVHT, DPD and WSPD only. Percentiles describe this filtered station-year, not global oceans. No current measurements in this file.')
(root/'observations.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
