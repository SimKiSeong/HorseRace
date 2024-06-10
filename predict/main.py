import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.linear_model import Ridge
from sklearn.linear_model import Lasso
from sklearn.linear_model import ElasticNet
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import AdaBoostRegressor
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.linear_model import BayesianRidge
import re
from sklearn.metrics import mean_squared_error
import numpy as np


data = pd.read_csv('./2023_05race_data.csv',low_memory=False,  on_bad_lines='skip', dtype={
    'age':'string',
    'hrNo':'string',
    'jkNo':'string',
    'owNo':'string',
    'rcDist':'string',
    'sex':'string',
    'trNo':'string',
    'track':'string',
    'weather':'string',
    'wgHr':'string',
    'rcTime':'string'
})

data = data.dropna()

features = ['age', 'hrNo', 'jkNo', 'owNo', 'rcDist', 'sex', 'trNo', 'track', 'weather', 'wgHr']
target = 'rcTime'
data = data[features + [target]]

#wgHr 컬럼 처리: 3자리 숫자만 추출
data['wgHr'] = data['wgHr'].apply(lambda x: int(re.match(r'^\d+', str(x)).group()) if re.match(r'^\d+', str(x)) else 0)
# track 컬럼 처리: 괄호 안의 숫자만 추출
data['track'] = data['track'].apply(lambda x: int(re.search(r'\((\d+)%\)', str(x)).group(1)) if re.search(r'\((\d+)%\)', str(x)) else 0)
# rcdist 컬럼 처리:
data['rcDist'] = pd.to_numeric(data['rcDist'], errors='coerce')
# owNo['']
data['owNo'] = pd.to_numeric(data['owNo'], errors='coerce')
# jkNo['']
data['jkNo'] = pd.to_numeric(data['jkNo'], errors='coerce')
# 암수 변경
data['sex'] = data['sex'].map({'암': 1, '수': 2, '거': 3})
# 날씨 변경
data['weather'] = data['weather'].map({'맑음': 1, '흐림': 2, '안개': 3, '비':4, '눈':5})

data = data.dropna()
print(data.shape[0])
#data.to_csv('before.csv',index=False)

# 특성 엔지니어링
X_train = data.drop(columns=[target])
y_train = data[target]

#모델 학습

#model = AdaBoostRegressor()
#model = BayesianRidge()
#model = DecisionTreeRegressor()
#model = ElasticNet()
#model = ExtraTreesRegressor()
model = GradientBoostingRegressor()
#model = Lasso()
#model = LinearRegression()
#model = MLPRegressor()
#model = RandomForestRegressor()
#model = Ridge()
#model = SVR()
#model = AdaBoostRegressor()
model.fit(X_train, y_train)

# 7. 다음 경기 순위 예측
# 새로운 데이터 (다음 경주에 대한 정보)가 있다고 가정합니다.
resultFeature = ['winOdds', 'rcNo', 'rcDate', 'hrName', 'meet']
new_data = pd.read_csv('./2023_06.csv')
new_data = new_data[features + resultFeature + [target]]


new_data.loc[new_data['meet'] != '서울', 'meet'] = float('nan')
#wgHr 컬럼 처리: 3자리 숫자만 추출
new_data['wgHr'] = new_data['wgHr'].apply(lambda x: int(re.match(r'^\d+', str(x)).group()) if re.match(r'^\d+', str(x)) else 0)
# track 컬럼 처리: 괄호 안의 숫자만 추출
new_data['track'] = new_data['track'].apply(lambda x: int(re.search(r'\((\d+)%\)', str(x)).group(1)) if re.search(r'\((\d+)%\)', str(x)) else 0)
# rcDist
new_data['rcDist'] = pd.to_numeric(new_data['rcDist'], errors='coerce')
# owNo['']
new_data['owNo'] = pd.to_numeric(new_data['owNo'], errors='coerce')
# jkNo['']
new_data['jkNo'] = pd.to_numeric(new_data['jkNo'], errors='coerce')
# 암수 변경
new_data['sex'] = new_data['sex'].map({'암': 1, '수': 2, '거': 3})
# 날씨 변경
new_data['weather'] = new_data['weather'].map({'맑음': 1, '흐림': 2, '안개': 3, '비':4, '눈':5})
#data.to_csv('before.csv',index=False)

# 데이터 결측시 제거
new_data = new_data.dropna()
X_predict = new_data.drop(columns=[target]+resultFeature)

predicted_times = model.predict(X_predict)
new_data['predicted_time'] = predicted_times

new_data.to_csv('predict.csv',index=False)

rmse = np.sqrt(mean_squared_error(new_data['rcTime'].values, new_data['predicted_time'].values))

print("RMSE between 'rcTime' and 'predictTime':", rmse)
