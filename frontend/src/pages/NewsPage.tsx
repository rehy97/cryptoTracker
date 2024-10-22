import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  Autocomplete,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment,
  CardActionArea,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface NewsArticle {
  title: string;
  description: string;
  author: string;
  url: string;
  updated_at: number;
  news_site: string;
  thumb_2x: string;
}

const NewsPage: React.FC = () => {
  const theme = useTheme();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string | null>('All');
  const [limit, setLimit] = useState<number>(10);
  const [loadedCount, setLoadedCount] = useState<number>(10);

  const placeholderImage = 'https://via.placeholder.com/400?text=No+Image+Available';

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/news?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNews(data.data);
    } catch (err) {
      setError('Chyba při načítání novinek.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [limit]);

  const handleRefresh = () => {
    fetchNews();
  };

  const loadMore = () => {
    setLimit((prevLimit) => prevLimit + 10);
    setLoadedCount((prevCount) => prevCount + 10);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredNews = news
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSite = selectedSite === 'All' || article.news_site === selectedSite;
      return matchesSearch && matchesSite;
    })
    .sort((a, b) => b.updated_at - a.updated_at);

  const newsSites = ['All', ...Array.from(new Set(news.map((article) => article.news_site)))];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" color="error" align="center" gutterBottom>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Nejnovější kryptoměnové zprávy
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
          <TextField
            label="Hledat zprávy"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              value={selectedSite}
              onChange={(event, newValue) => {
                setSelectedSite(newValue);
              }}
              options={newsSites}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zdroj zpráv"
                  placeholder="Vyberte zdroj"
                />
              )}
              sx={{ width: 200 }}
            />
            <Tooltip title="Obnovit zprávy">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Grid container spacing={4}>
          {filteredNews.slice(0, loadedCount).map((article, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardActionArea 
                  onClick={() => window.open(article.url, '_blank')}
                  sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    height: '100%',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.thumb_2x || placeholderImage}
                    alt={article.title}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src = placeholderImage;
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{ color: 'primary.main' }}
                    >
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {truncateText(article.description, 100)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {article.author} • {new Date(article.updated_at * 1000).toLocaleString()} • {article.news_site}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={loadMore}>
            Načíst více
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewsPage;