import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, Grid, Avatar, Chip, Divider, 
  useMediaQuery, ToggleButton, ToggleButtonGroup, IconButton, Tab, Tabs
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { NumericFormat } from 'react-number-format';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

// Zástupné komponenty
const PlaceholderSection: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 2 }}>
    <Typography variant="h6">{title}</Typography>
    <Typography>This section is under development.</Typography>
  </Box>
);

const NewsSection: React.FC = () => <PlaceholderSection title="News" />;
const OrderBook: React.FC = () => <PlaceholderSection title="Order Book" />;
const CommentSection: React.FC = () => <PlaceholderSection title="Comments" />;
const EducationSection: React.FC = () => <PlaceholderSection title="Education" />;
const ProfitCalculator: React.FC = () => <PlaceholderSection title="Profit Calculator" />;
const SentimentIndicator: React.FC = () => <PlaceholderSection title="Market Sentiment" />;

const CryptoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [crypto, setCrypto] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any>(null);
    const [chartPeriod, setChartPeriod] = useState('7d');
    const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchCryptoDetail = async () => {
            try {
                const [assetResponse, historyResponse] = await Promise.all([
                    axios.get(`https://api.coincap.io/v2/assets/${id}`),
                    axios.get(`https://api.coincap.io/v2/assets/${id}/history`, {
                        params: { 
                            interval: chartPeriod === '7d' ? 'h1' : chartPeriod === '30d' ? 'h6' : 'd1',
                            start: new Date(Date.now() - (chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 30 : 365) * 24 * 60 * 60 * 1000).getTime(),
                            end: Date.now()
                        }
                    })
                ]);

                setCrypto(assetResponse.data.data);

                const formattedChartData = historyResponse.data.data.map((price: any) => ({
                    x: new Date(price.time).getTime(),
                    y: parseFloat(price.priceUsd)
                }));

                setChartData(formattedChartData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cryptocurrency details:', error);
                setLoading(false);
            }
        };

        fetchCryptoDetail();
    }, [id, chartPeriod]);
    const handleChartPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
        if (newPeriod !== null) {
            setChartPeriod(newPeriod);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // Zde by byla logika pro změnu tématu v celé aplikaci
    };

    const toggleWatchlist = () => {
        setIsWatchlisted(!isWatchlisted);
        // Zde by byla logika pro přidání/odebrání z watchlistu
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const chartOptions: ApexOptions = {
        chart: {
            type: 'area',
            height: 350,
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true
            },
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 100]
            }
        },
        xaxis: {
            type: 'datetime',
            tooltip: {
                enabled: false
            }
        },
        yaxis: {
            labels: {
                formatter: (value) => `$${value.toFixed(2)}`
            }
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            },
            y: {
                formatter: function (val) {
                    return `$${val.toFixed(2)}`;
                }
            }
        },
        theme: {
            mode: darkMode ? 'dark' : 'light'
        },
        colors: [theme.palette.primary.main]
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!crypto) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography variant="h6">Cryptocurrency not found</Typography>
            </Box>
        );
    }

    const priceChangeColor = parseFloat(crypto.changePercent24Hr) >= 0 ? 'success.main' : 'error.main';
    const PriceChangeIcon = parseFloat(crypto.changePercent24Hr) >= 0 ? TrendingUpIcon : TrendingDownIcon;

    return (
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar alt={crypto.name} src={`https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`} sx={{ width: 60, height: 60, mr: 2 }} />
                            <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                    {crypto.name}
                                </Typography>
                                <Chip label={crypto.symbol} color="primary" size="small" />
                            </Box>
                        </Box>
                        <Box>
                            <IconButton onClick={toggleWatchlist}>
                                {isWatchlisted ? <StarIcon color="primary" /> : <StarOutlineIcon />}
                            </IconButton>
                            <IconButton>
                                <NotificationsNoneIcon />
                            </IconButton>
                            <IconButton onClick={toggleDarkMode}>
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                            <NumericFormat
                                value={parseFloat(crypto.priceUsd)}
                                displayType={'text'}
                                thousandSeparator={true}
                                prefix={'$'}
                                decimalScale={2}
                            />
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PriceChangeIcon sx={{ color: priceChangeColor, mr: 1 }} />
                            <Typography variant="body1" sx={{ color: priceChangeColor, fontWeight: 'bold' }}>
                                {parseFloat(crypto.changePercent24Hr).toFixed(2)}%
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>Market Stats</Typography>
                        <Grid container spacing={1}>
                            {[
                                { label: 'Market Cap', value: parseFloat(crypto.marketCapUsd) },
                                { label: 'Volume (24h)', value: parseFloat(crypto.volumeUsd24Hr) },
                                { label: 'Circulating Supply', value: parseFloat(crypto.supply) },
                                { label: 'Max Supply', value: parseFloat(crypto.maxSupply) },
                            ].map((item, index) => (
                                <Grid item xs={6} key={index}>
                                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        <NumericFormat
                                            value={item.value}
                                            displayType={'text'}
                                            thousandSeparator={true}
                                            prefix={item.label.includes('Supply') ? '' : '$'}
                                            decimalScale={0}
                                        />
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Price Chart</Typography>
                                <ToggleButtonGroup
                                    value={chartPeriod}
                                    exclusive
                                    onChange={handleChartPeriodChange}
                                    size="small"
                                >
                                    <ToggleButton value="7d">7D</ToggleButton>
                                    <ToggleButton value="30d">30D</ToggleButton>
                                    <ToggleButton value="1y">1Y</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            {chartData && (
                                <Box sx={{ height: isMobile ? 300 : 400 }}>
                                    <ReactApexChart
                                        options={chartOptions}
                                        series={[{ name: 'Price', data: chartData }]}
                                        type="area"
                                        height="100%"
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
                
                <Box sx={{ width: '100%', mt: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                        <Tab label="News" />
                        <Tab label="Order Book" />
                        <Tab label="Comments" />
                        <Tab label="Education" />
                        <Tab label="Profit Calculator" />
                    </Tabs>
                </Box>
                <Box sx={{ mt: 2 }}>
                    {activeTab === 0 && <NewsSection />}
                    {activeTab === 1 && <OrderBook />}
                    {activeTab === 2 && <CommentSection />}
                    {activeTab === 3 && <EducationSection />}
                    {activeTab === 4 && <ProfitCalculator />}
                </Box>
                
                <Box sx={{ mt: 4 }}>
                    <SentimentIndicator />
                </Box>
            </Paper>
        </Box>
    );
};

export default CryptoDetail;