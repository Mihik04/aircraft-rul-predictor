# check_lg_data_variation.py
import pandas as pd
from pathlib import Path

df = pd.read_csv("datasets/landing_gear_rul_clean.csv")  # change path if different

features = ["load_during_landing", "tire_pressure", "speed_during_landing"]
print(df[features].describe())
