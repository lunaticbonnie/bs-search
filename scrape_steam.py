import csv
import json
import os
import re
import time
import requests
from html.parser import HTMLParser

# params
GAMES_CSV_PATH = "steam.csv"
START_TXT_PATH = "start.txt"
PAGE_SIZE = 50
SECONDS_BETWEEN_REQUESTS = 60
assert(SECONDS_BETWEEN_REQUESTS >= 10)

# request utils
def fetch_text(url, params = None, **kwargs):
  time.sleep(SECONDS_BETWEEN_REQUESTS)
  response = requests.get(url, params, **kwargs)
  print(f"status: {response.status_code} {response.reason}")
  response.encoding = "utf8"
  return response, response.status_code == 200

# html utils
class HtmlParser(HTMLParser):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.current_element = None
    self.nodes = []
  def handle_starttag(self, tag, attrs):
    acc = {"tagName": tag, "id": "", "class": "", "textContent": ""}
    for k, v in attrs: acc[k] = v
    # NOTE: this is technically incorrect, but I don't want to fix self-closing tags in the built-in parser
    self.current_element = acc
    self.nodes.append(acc)
  def handle_endtag(self, tag):
    self.current_element = None
  def handle_data(self, data):
    if self.current_element != None:
      self.current_element["textContent"] += data.strip()
  @staticmethod
  def find_elements(text: str):
    parser = HtmlParser()
    for node in parser.nodes:
      print(f"nodes: {node}")
    parser.feed(text)
    return parser.nodes

def find_html_element(text: str, key):
  elements = HtmlParser.find_elements(text)
  for element in elements:
    if key(element): return element
def find_html_elements(text: str, key):
  elements = HtmlParser.find_elements(text)
  return [v for v in elements if key(v)]

# file utils
def write_file_atomically(file_path: str, content: str):
  tmp_file_path = f"{file_path}.tmp"
  with open(tmp_file_path, "w+", encoding="utf8") as f:
    f.write(content)
  os.replace(tmp_file_path, file_path)

def read_games_csv(file_path: str):
  acc = dict[str, list[str]]()
  try:
    with open(file_path, "r", encoding="utf8", newline='') as f:
      for row in csv.reader(f, delimiter=';', skipinitialspace=True):
        acc[row[0]] = row
  except FileNotFoundError:
    pass
  return acc
def write_games_csv(file_path: str, csv: dict[str, list[str]]):
  content = ""
  for row in csv.values():
    content += f"{"; ".join(row)}\n"
  write_file_atomically(file_path, content)

def write_int(file_path: str, value: int):
  content = str(value)
  write_file_atomically(file_path, content)
def read_int(file_path: str) -> int:
  try:
    with open(file_path, "r", encoding="utf8") as f:
      return int(f.read().strip())
  except FileNotFoundError:
    return 0

if __name__ == "__main__":
  # read cached `games_csv`
  games = read_games_csv(GAMES_CSV_PATH)
  start = read_int(START_TXT_PATH)
  while True:
    # GET next page of `app_ids`
    print(f"-- {start}:{start + PAGE_SIZE} --")
    response, response_ok = fetch_text("https://store.steampowered.com/search/results/", {
      # DLC=21, Software=994, Mods=997, Games=998
      "category1": "21,994,997,998",
      "start": start,
      "count": PAGE_SIZE,
      "sort_by": "Released_DESC",
      "infinite": 1,
    })
    assert(response_ok)
    data = json.loads(response.text)
    total_count = data["total_count"]
    print(f"total_count: {total_count}")
    # parse `results_html`
    results_html = data["results_html"]
    app_ids = re.findall(r'data-ds-appid="(\d+)"', results_html)
    print(f"app_ids: {app_ids}")
    # set next request to next page
    start += PAGE_SIZE
    if start > total_count: start = 0
    write_int(START_TXT_PATH, start)
    # get game infos
    for app_id in app_ids:
      print(f"-- {app_id} --")
      response, response_ok = fetch_text(f"https://store.steampowered.com/app/{app_id}")
      if not response_ok: continue
      # parse app name
      html = response.text
      name_node = find_html_element(html, lambda node: node["id"] == "appHubAppName")
      name = name_node["textContent"]
      print(f"name: {name}")
      # parse recent reviews
      recent_reviews_node = find_html_element(html, lambda node: "user_reviews_summary_row" in node["class"])
      recent_reviews = recent_reviews_node["data-tooltip-html"]
      print(f"recent_reviews: {recent_reviews}")
      # parse tags
      tag_nodes = find_html_elements(html, lambda node: node["tagName"] == "a" and "app_tag" in node["class"] and "add_button" not in node["class"])
      tags = [node["textContent"] for node in tag_nodes]
      print(f"tags: {tags}")
      games[app_id] = [app_id, name, recent_reviews, *tags]
    write_games_csv(GAMES_CSV_PATH, games)
