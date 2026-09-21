from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parent
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1100},reduced_motion='reduce')
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 for view in ['whole','power','underwater','surface']:
  page.goto((root/(view+'.html')).as_uri())
  page.wait_for_selector('#key li')
  assert page.locator('#key li').count()>=10
  assert page.locator('#metrics .metric').count()==4
  page.screenshot(path=str(root/'previews'/f'{view}.png'),full_page=True)
  page.locator('#preset').select_option('0')
  assert 'SYNTHETIC' in page.locator('#provenance').inner_text()
  assert '0 W' in page.locator('#metrics').inner_text() if view in ['whole','power','surface'] else True
  page.locator('#preset').select_option('10')
  assert 'Survival mode' in page.locator('#warnings').inner_text()
  page.locator('#preset').select_option('4')
  before=page.locator('#metrics').inner_text()
  page.locator('#L').fill('40');page.locator('#L').dispatch_event('input')
  page.wait_for_timeout(500)
  assert page.locator('#L-out').inner_text()=='40 m'
  page.locator('#joint').select_option('rigid');page.wait_for_timeout(500)
  assert 'Rigid-lock' in page.locator('#warnings').inner_text()
  page.locator('#play').click();page.wait_for_timeout(350);page.locator('#play').click()
  assert page.locator('#clock').inner_text()!='0.0 s'
  page.set_viewport_size({'width':390,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
  page.screenshot(path=str(root/'previews'/f'{view}-mobile.png'),full_page=True)
  page.set_viewport_size({'width':1440,'height':1100})
 assert not errors,errors
 print(json.dumps({'pages':4,'runtimeErrors':errors,'checked':['component labels','calm','storm','length slider','rigid lock','playback','mobile overflow']},indent=2))
 browser.close()
