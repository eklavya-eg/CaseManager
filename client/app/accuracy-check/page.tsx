"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BASE_URL } from '@/config';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Dummy data for accuracy metrics
const modelAccuracy = [
  { model_id: '1', model: 'Case Classifier', accuracy: 97.2, precision: 95.8, recall: 94.3, f1: 95.0, fp: 10 },
  { model_id: '2', model: 'Sentiment Analyzer', accuracy: 94.8, precision: 93.2, recall: 92.7, f1: 92.9, fp: 8 },
  { model_id: '3', model: 'Priority Predictor', accuracy: 91.5, precision: 89.8, recall: 88.4, f1: 89.1, fp: 4 },
  { model_id: '4', model: 'Category Classifier', accuracy: 96.3, precision: 94.7, recall: 95.1, f1: 94.9, fp: 9 },
];

const accuracyTrend = [
  { date: 'Jan', accuracy: 94.2 },
  { date: 'Feb', accuracy: 96.8 },
  { date: 'Mar', accuracy: 95.1 },
  { date: 'Apr', accuracy: 94.8 },
  { date: 'May', accuracy: 96.2 },
  { date: 'Jun', accuracy: 97.2 },
  { date: 'Jul', accuracy: 97.5 },
  { date: 'Aug', accuracy: 98.2 },
  { date: 'Sep', accuracy: 98.8 },
  { date: 'Oct', accuracy: 99.2 },
  { date: 'Nov', accuracy: 99.5 },
  { date: 'Dec', accuracy: 99.8 },
];

const confusionMatrix = [
  { predicted: 'Legal', actual: 'Legal', value: 450 },
  { predicted: 'Legal', actual: 'Medical', value: 12 },
  { predicted: 'Legal', actual: 'Financial', value: 8 },
  { predicted: 'Medical', actual: 'Legal', value: 15 },
  { predicted: 'Medical', actual: 'Medical', value: 380 },
  { predicted: 'Medical', actual: 'Financial', value: 10 },
  { predicted: 'Financial', actual: 'Legal', value: 5 },
  { predicted: 'Financial', actual: 'Medical', value: 18 },
  { predicted: 'Financial', actual: 'Financial', value: 290 },
];

const performanceMetrics = [
  { name: 'Overall Accuracy', value: 97.2, target: 95.0, color: '#10B981' },
  { name: 'Precision', value: 94.8, target: 90.0, color: '#3B82F6' },
  { name: 'Recall', value: 93.5, target: 88.0, color: '#8B5CF6' },
  { name: 'F1-Score', value: 94.1, target: 89.0, color: '#F59E0B' },
];

export default function AccuracyCheck() {
  const [data, setData] = useState();
  const [metrics, setMetrics] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]); // accuracy, fp, fn, tp, tn, total
  const [performanceMetrics, setPerformanceMetrics] = useState<{ name: string, value: number, target: number, color: string }[]>([]);
  const [accuracyTrend, setAccuracyTrend] = useState<{ date: string, accuracy: number }[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<{ model_id: string, model: string, accuracy: number, precision: number, recall: number, f1: number, fp: number }[]>([]);
  const fetchData = async () => {
    const mainData = await axios.get(`${BASE_URL}/v1/prediction-statuses`, {
      params: {
      }
    });
    const data = mainData.data.statuses.filter(({ status, accuracy }: { status: string, accuracy: number }) => {
      return status === "success" && accuracy > 0;
    })
    const new_metrics = [0, 0, 0, 0, 0, 0];
    for (const status of data) {
      delete status?.finalcols;
      new_metrics[0] += status?.accuracy || 0;
      new_metrics[1] += status?.false_positive || 0;
      new_metrics[2] += status?.false_negative || 0;
      new_metrics[3] += status?.true_positive || 0;
      new_metrics[4] += status?.true_negative || 0;
      new_metrics[5] += (status?.accuracy | 0) == 0 ? 0 : status?.total || 0;
    }
    setMetrics(new_metrics);
    setData(data);
    console.log(data);
    const precision = new_metrics[3] / (new_metrics[1] + new_metrics[3]);
    const recall = new_metrics[3] / (new_metrics[2] + new_metrics[3]);
    const f1 = 2 * precision * recall / (precision + recall);
    setPerformanceMetrics([
      { name: 'Accuracy', value: Number((new_metrics[0] * 100 / data.length).toFixed(2)), target: 95.0, color: '#10B981' },
      { name: 'Precision', value: Number((precision * 100).toFixed(2)), target: 90.0, color: '#3B82F6' },
      { name: 'Recall', value: Number((recall * 100).toFixed(2)), target: 88.0, color: '#8B5CF6' },
      { name: 'F1-Score', value: Number((f1 * 100).toFixed(2)), target: 89.0, color: '#F59E0B' },
    ]);

    const sorted = data.sort(
      (a:{created_at:string}, b:{created_at:string}) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const monthMap: { [key: string]: number[] } = {};

    sorted.forEach((d:{created_at:string, accuracy:number}) => {
      const dt = new Date(d.created_at)
      const key = dt.toLocaleString('en-US', { month: 'short' })

      if (!monthMap[key]) monthMap[key] = []
      monthMap[key].push(d.accuracy * 100)
    })

    const accuracyTrend = Object.entries(monthMap).map(
      ([date, accs]) => ({
        date,
        accuracy: +(accs.reduce((a, b) => a + b, 0) / accs.length).toFixed(1)
      })
    )

    setAccuracyTrend(accuracyTrend);

    const groupedByModel = data.reduce((acc:any, d:any) => {
      (acc[d.model_id] ||= []).push(d)
      return acc
    }, {})
    const keys = Object.keys(groupedByModel);
    const modelAccuracies = [];
    for (const model_id of keys) {
      const model = groupedByModel[model_id];
      const accuracy = model.reduce((s:number, o:{accuracy:number}) => s + o.accuracy, 0) / model.length;
      const fp = model.reduce((s:number, o:{false_positive:number}) => s + o.false_positive, 0);
      const fn = model.reduce((s:number, o:{false_negative:number}) => s + o.false_negative, 0);
      const tp = model.reduce((s:number, o:{true_positive:number}) => s + o.true_positive, 0);
      const tn = model.reduce((s:number, o:{true_negative:number}) => s + o.true_negative, 0);
      const total = model.reduce((s:number, o:{total:number}) => s + o.total, 0);
      const precision = ((tp / (tp + fp))*100).toFixed(2);
      const recall = ((tp / (tp + fn))*100).toFixed(2);
      const f1 = ((2 * Number(precision) * Number(recall) / (Number(precision) + Number(recall)))).toFixed(2);
      const model_name = model[0]?.model_name || '';
      const new_model = { model_id, model:model_name, accuracy:Number(accuracy.toFixed(2)), precision:Number(precision), recall:Number(recall), f1:Number(f1), fp: Number((fp*100/total).toFixed(2)) };
      modelAccuracies.push(new_model);
    }

    setModelAccuracy(modelAccuracies);

  }
  useEffect(() => {
    fetchData();
  }, [])
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Accuracy Check
        </h1>
        <p className="text-slate-600">
          Monitor and analyze model performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{metric.name}</p>
                  <div className="flex items-baseline mt-1">
                    <p className="text-2xl font-bold text-slate-900">{metric.value}%</p>
                    <p className="text-sm text-slate-500 ml-2">Target: {metric.target}%</p>
                  </div>
                  <div className="flex items-center mt-2">
                    {metric.value >= metric.target ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <Badge
                      className={`ml-2 ${metric.value >= metric.target
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                        }`}
                    >
                      {metric.value >= metric.target ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={metric.color}
                      strokeWidth="3"
                      strokeDasharray={`${metric.value}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-700">{metric.value}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Model Performance Comparison */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Model Performance Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelAccuracy} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                <YAxis domain={[80, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accuracy Trend */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Accuracy Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis domain={[90, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Detailed Metrics */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span>Detailed Model Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-900">Model</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-900">Accuracy</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-900">Precision</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-900">Recall</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-900">F1-Score</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-900">False Positive</th>
                  </tr>
                </thead>
                <tbody>
                  {modelAccuracy.map((model, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-900">{model.model}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{model.accuracy}%</span>
                          {model.accuracy >= 95 && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-700">{model.precision}%</td>
                      <td className="py-3 px-2 text-slate-700">{model.recall}%</td>
                      <td className="py-3 px-2 text-slate-700">{model.f1}%</td>
                      <td className="py-3 px-2 text-slate-700">{model.fp}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Model Status */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Model Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Case Classifier v3', status: 'excellent', score: 97.2, trend: 'up' },
                { name: 'Sentiment Analyzer v2', status: 'good', score: 94.8, trend: 'stable' },
                { name: 'Priority Predictor v1', status: 'warning', score: 91.5, trend: 'down' },
                { name: 'Category Classifier v2', status: 'good', score: 96.3, trend: 'up' },
              ].map((model, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${model.status === 'excellent' ? 'bg-green-500' :
                      model.status === 'good' ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`} />
                    <div>
                      <p className="font-medium text-slate-900">{model.name}</p>
                      <p className="text-xs text-slate-500">
                        Status: <span className="capitalize">{model.status}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{model.score}%</p>
                    <div className="flex items-center justify-end mt-1">
                      {model.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : model.trend === 'down' ? (
                        <TrendingUp className="h-3 w-3 text-red-600 transform rotate-180" />
                      ) : (
                        <div className="w-3 h-0.5 bg-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}