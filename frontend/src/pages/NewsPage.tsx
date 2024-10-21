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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';

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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('latest');
  const [limit, setLimit] = useState<number>(10); // Number of articles to load
  const [loadedCount, setLoadedCount] = useState<number>(10); // Count of currently loaded articles

  // Placeholder image URL in case of missing or failed image loading
  const placeholderImage = 'https://via.placeholder.com/400?text=No+Image+Available';

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true); // Start loading
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
        setLoading(false); // Stop loading
      }
    };

    fetchNews();
  }, [limit]); // Fetch news whenever the limit changes

  // Load more articles
  const loadMore = () => {
    setLimit((prevLimit) => prevLimit + 10); // Increase the limit by 10
    setLoadedCount((prevCount) => prevCount + 10); // Update the loaded count
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Filter and sort the news articles
  const filteredNews = news
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSite = selectedSite === 'All' || article.news_site === selectedSite;
      return matchesSearch && matchesSite;
    })
    .sort((a, b) => {
      if (sortOption === 'latest') {
        return b.updated_at - a.updated_at; // Most recent first
      } else {
        return a.title.localeCompare(b.title); // Alphabetical order
      }
    });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
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
        <Typography variant="h3" align="center" gutterBottom>
          Nejnovější kryptoměnové zprávy
        </Typography>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Hledat..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="news-site-label">Zprávy od</InputLabel>
            <Select
              labelId="news-site-label"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <MenuItem value="All">Všechny</MenuItem>
              {Array.from(new Set(news.map((article) => article.news_site))).map((site) => (
                <MenuItem key={site} value={site}>
                  {site}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-label">Seřadit podle</InputLabel>
            <Select
              labelId="sort-label"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="latest">Nejnovější</MenuItem>
              <MenuItem value="alphabetical">Abecedně</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Grid container spacing={4}>
          {filteredNews.slice(0, loadedCount).map((article, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={article.thumb_2x || placeholderImage}
                  alt={article.title}
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                    onClick={() => window.open(article.url, '_blank')} // Open in new tab
                  >
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {truncateText(article.description, 100)} {/* Truncate to 100 characters */}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {article.author} &bull; {new Date(article.updated_at * 1000).toLocaleString()} &bull; {article.news_site}
                  </Typography>
                </CardContent>
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
