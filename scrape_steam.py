import json
import os
import re
import time
from requests import get

APP_IDS_PATH = "app_ids.csv"
START_INT_PATH = "start.txt"
PAGE_SIZE = 50

def write_file_atomically(file_path: str, content: str):
  tmp_file_path = f"{file_path}.tmp"
  with open(tmp_file_path, "w+", encoding="utf8") as f:
    f.write(content)
  os.replace(tmp_file_path, file_path)

def write_csv_set(file_path: str, csv: set[str]):
  content = "\n".join(k for k in csv)
  write_file_atomically(file_path, content)
def read_csv_set(file_path: str) -> set[str]:
  acc = set[str]()
  try:
    with open(file_path, "r") as f:
      for line in f.readlines():
        if line: acc.add(line.strip())
  except FileNotFoundError:
    pass
  return acc

def write_int(file_path: str, value: int):
  content = str(value)
  write_file_atomically(file_path, content)
def read_int(file_path: str) -> int:
  try:
    with open(file_path, "r") as f:
      return int(f.read().strip())
  except FileNotFoundError:
    return 0

if __name__ == "__main__":
  # read cached `app_ids`
  app_ids = read_csv_set(APP_IDS_PATH)
  # GET new `app_ids`
  start = read_int(START_INT_PATH)
  total_count = len(app_ids) + 1
  while len(app_ids) < total_count:
    response = get("https://store.steampowered.com/search/results/", {
      "start": start,
      "count": PAGE_SIZE,
      "sort_by": "Released_DESC",
      "infinite": 1,
    })
    print(f"status: {response.status_code} {response.reason}")
    if response.status_code != 200: break
    # parse `total_count`
    response.encoding = "utf8"
    data = json.loads(response.text)
    total_count = data["total_count"]
    print(f"total_count: {total_count}")
    # parse `results_html`
    results_html = data["results_html"]
    matches = re.findall(r'data-ds-appid="(\d+)"', results_html)
    print(f"matches: {matches}")
    if len(matches) == 0: break
    for app_id in matches:
      app_ids.add(app_id)
    # throttle next request
    start += PAGE_SIZE
    if start > total_count: start = 0
    write_int(START_INT_PATH, start)
    break
    time.sleep(30)
  # write `app_ids`` to cache
  write_csv_set(APP_IDS_PATH, app_ids)