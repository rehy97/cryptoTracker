import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import GaugeChart from 'react-gauge-chart';

interface FearGreedGaugeProps {
  value: number;
}

const getSentiment = (value: number) => {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 50) return 'Fear';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
};

const chartStyle = {
  width: '100%',
} as const;

const FearGreedGauge: React.FC<FearGreedGaugeProps> = React.memo(({ value }) => {
  const theme = useTheme();
  
  // Memoize colors array since it depends on theme which shouldn't change often
  const colors = useMemo(() => [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.light,
    theme.palette.success.main
  ], [theme.palette]);

  // Memoize needle colors
  const needleColors = useMemo(() => ({
    needleColor: theme.palette.grey[400],
    needleBaseColor: theme.palette.grey[700]
  }), [theme.palette.grey]);

  // Memoize sentiment since it only depends on value
  const sentiment = useMemo(() => getSentiment(value), [value]);

  // Memoize percent calculation
  const percent = useMemo(() => value / 100, [value]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <GaugeChart
        id="fear-greed-gauge"
        nrOfLevels={4}
        colors={colors}
        arcWidth={0.3}
        percent={percent}
        hideText={true}
        needleColor={needleColors.needleColor}
        needleBaseColor={needleColors.needleBaseColor}
        style={chartStyle}
      />
      <Typography variant="h4" sx={{ mt: 2 }}>{value}</Typography>
      <Typography variant="body1">{sentiment}</Typography>
    </Box>
  );
});

// Add display name for better debugging
FearGreedGauge.displayName = 'FearGreedGauge';

export default FearGreedGauge;