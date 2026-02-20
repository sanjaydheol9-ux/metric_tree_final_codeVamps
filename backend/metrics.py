import json
import pandas as pd
import numpy as np
from dataclasses import dataclass, field, asdict
from typing import Optional
from scipy import stats

WEIGHTS = {
    "picking": 0.4,
    "packing": 0.3,
    "dispatch": 0.3,
}

ALERT_THRESHOLDS = {
    "delivery_score": {"warning": 60, "critical": 40},
    "picking_score":  {"warning": 55, "critical": 35},
    "packing_score":  {"warning": 55, "critical": 35},
    "dispatch_score": {"warning": 55, "critical": 35},
    "error_rate":     {"warning": 0.3, "critical": 0.5},
}


@dataclass
class Alert:
    metric: str
    level: str
    value: float
    threshold: float
    message: str


@dataclass
class BenchmarkRating:
    metric: str
    value: float
    rating: str
    percentile_estimate: float


@dataclass
class Forecast:
    metric: str
    next_week_value: float
    trend: str
    slope: float
    r_squared: float
    confidence: str


@dataclass
class WeekMetrics:
    week: int
    picking_score: float
    packing_score: float
    dispatch_score: float
    delivery_score: float
    error_rate: float
    sample_size: int
    alerts: list = field(default_factory=list)
    benchmarks: list = field(default_factory=list)
    forecasts: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

    def to_metric_tree(self) -> dict:
        return {
            "name": "Delivery Timeliness",
            "value": self.delivery_score,
            "status": self._score_status(self.delivery_score),
            "alerts": [a.level for a in self.alerts if a.metric == "delivery_score"],
            "children": [
                {"name": "Picking Efficiency",   "value": self.picking_score,  "weight": WEIGHTS["picking"],  "status": self._score_status(self.picking_score)},
                {"name": "Packing Efficiency",   "value": self.packing_score,  "weight": WEIGHTS["packing"],  "status": self._score_status(self.packing_score)},
                {"name": "Dispatch Performance", "value": self.dispatch_score, "weight": WEIGHTS["dispatch"], "status": self._score_status(self.dispatch_score)},
            ],
        }

    @staticmethod
    def _score_status(score: float) -> str:
        if score >= 75: return "excellent"
        if score >= 60: return "good"
        if score >= 40: return "average"
        return "poor"


def _generate_alerts(metrics: dict) -> list:
    alerts = []
    for metric, thresholds in ALERT_THRESHOLDS.items():
        value = metrics.get(metric)
        if value is None:
            continue

        is_low_good = metric == "error_rate"
        critical, warning = thresholds["critical"], thresholds["warning"]

        if is_low_good:
            level = "critical" if value >= critical else "warning" if value >= warning else None
        else:
            level = "critical" if value <= critical else "warning" if value <= warning else None

        if level:
            threshold = critical if level == "critical" else warning
            alerts.append(Alert(
                metric=metric,
                level=level,
                value=round(value, 2),
                threshold=threshold,
                message=(
                    f"{metric.replace('_', ' ').title()} is {level.upper()}: {value:.2f} "
                    f"({'above' if is_low_good else 'below'} threshold of {threshold})"
                ),
            ))
    return alerts


def _forecast_metric(series: pd.Series, metric_name: str) -> Optional[Forecast]:
    if len(series) < 3:
        return None

    x = np.arange(len(series))
    slope, intercept, r_value, _, _ = stats.linregress(x, series.values)
    next_value = intercept + slope * len(series)
    r_squared  = r_value ** 2
    trend      = "stable" if abs(slope) <= 0.5 else ("improving" if slope > 0 else "degrading")
    confidence = "high" if r_squared > 0.7 else "medium" if r_squared > 0.4 else "low"

    return Forecast(
        metric=metric_name,
        next_week_value=round(next_value, 2),
        trend=trend,
        slope=round(slope, 4),
        r_squared=round(r_squared, 4),
        confidence=confidence,
    )


def load_data(path: str = "sample_Data.csv") -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"week", "delivery_score", "accuracy_score", "dispatch_score", "warehouse_score", "on_time_score"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")
    return df


def calculate_week_metrics(week: int, df: Optional[pd.DataFrame] = None) -> WeekMetrics:
    if df is None:
        df = load_data()

    df_week = df[df["week"] == week]
    if df_week.empty:
        raise ValueError(f"No data found for week {week}.")

    # Map CSV columns to metric scores
    picking_score  = float(df_week["warehouse_score"].mean())
    packing_score  = float(df_week["accuracy_score"].mean())
    dispatch_score = float(df_week["dispatch_score"].mean())
    delivery_score = float(df_week["delivery_score"].mean())
    # Derive error_rate from on_time_score (0.0 to 1.0 scale)
    error_rate     = round(1.0 - float(df_week["on_time_score"].mean()) / 100.0, 4)

    alerts = _generate_alerts({
        "delivery_score": delivery_score,
        "picking_score":  picking_score,
        "packing_score":  packing_score,
        "dispatch_score": dispatch_score,
        "error_rate":     error_rate,
    })

    # Forecasts based on historical weekly averages
    history = df[df["week"] <= week].groupby("week")
    forecasts = []
    for col, name in [("delivery_score", "delivery_score"), ("dispatch_score", "dispatch_score"), ("warehouse_score", "picking_score")]:
        f = _forecast_metric(history[col].mean().sort_index(), name)
        if f:
            forecasts.append(f)

    # Simple benchmarks based on score ranges
    benchmarks = []
    for metric_name, value in [("delivery_score", delivery_score), ("dispatch_score", dispatch_score), ("warehouse_score", picking_score)]:
        if value >= 80:
            rating, pct = "excellent", 90.0
        elif value >= 65:
            rating, pct = "good", 70.0
        elif value >= 50:
            rating, pct = "average", 40.0
        else:
            rating, pct = "poor", 15.0
        benchmarks.append(BenchmarkRating(metric=metric_name, value=round(value, 2), rating=rating, percentile_estimate=pct))

    return WeekMetrics(
        week=week,
        picking_score=round(picking_score, 2),
        packing_score=round(packing_score, 2),
        dispatch_score=round(dispatch_score, 2),
        delivery_score=round(delivery_score, 2),
        error_rate=round(error_rate, 4),
        sample_size=len(df_week),
        alerts=alerts,
        benchmarks=benchmarks,
        forecasts=forecasts,
    )


def compare_weeks(weeks: list, df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    if df is None:
        df = load_data()

    rows = []
    for week in weeks:
        try:
            m = calculate_week_metrics(week, df=df)
            rows.append({
                "week":            m.week,
                "delivery_score":  m.delivery_score,
                "picking_score":   m.picking_score,
                "packing_score":   m.packing_score,
                "dispatch_score":  m.dispatch_score,
                "error_rate":      m.error_rate,
                "sample_size":     m.sample_size,
                "critical_alerts": sum(1 for a in m.alerts if a.level == "critical"),
                "warning_alerts":  sum(1 for a in m.alerts if a.level == "warning"),
            })
        except ValueError:
            continue

    result = pd.DataFrame(rows).set_index("week")
    if len(result) > 1:
        result["delivery_score_delta"] = result["delivery_score"].diff().round(2)
    return result


def metric_tree(week: int, df: Optional[pd.DataFrame] = None) -> dict:
    return calculate_week_metrics(week, df=df).to_metric_tree()


if __name__ == "__main__":
    df = load_data()
    weeks = sorted(df["week"].unique())
    latest = weeks[-1]
    m = calculate_week_metrics(latest, df=df)
    print(f"Week {latest}: delivery={m.delivery_score}, picking={m.picking_score}, dispatch={m.dispatch_score}")
    print(f"Alerts: {len(m.alerts)}")
    print(json.dumps(metric_tree(latest, df=df), indent=2))
