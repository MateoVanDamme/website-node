const express = require('express');
const router = express.Router();

// Projects page (home)
router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Projects',
    activePage: 'Projects'
  });
});

// Astrophotography
router.get('/astrophotography', (req, res) => {
  res.render('pages/astrophotography', {
    title: 'Astrophotography',
    activePage: 'Astrophotography'
  });
});

// 3D Printing
router.get('/3d-printing', (req, res) => {
  res.render('pages/3d-printing', {
    title: '3D Printing',
    activePage: '3D Printing'
  });
});

// Art
router.get('/art', (req, res) => {
  res.render('pages/art', {
    title: 'Art',
    activePage: 'Art'
  });
});

// Hackerspace hub
router.get('/hackerspace', (req, res) => {
  res.render('pages/hackerspace-hub', {
    title: 'Hackerspace',
    activePage: 'Hackerspace'
  });
});

// Hackerspace Gent Website detail
router.get('/hackerspace/website', (req, res) => {
  res.render('pages/hackerspace', {
    title: 'Hackerspace Gent Website',
    activePage: 'Hackerspace'
  });
});

// Flyover Ghent
router.get('/flyover-ghent', (req, res) => {
  res.render('pages/flyover-ghent', {
    title: 'Flyover Ghent',
    activePage: 'Flyover Ghent'
  });
});

// Redirect old nested URL to the new top-level page
router.get('/art/flyover-ghent', (req, res) => {
  res.redirect(301, '/flyover-ghent');
});

// LED-BARt
router.get('/hackerspace/ledbart', (req, res) => {
  res.render('pages/ledbart', {
    title: 'LED-BARt',
    activePage: 'Hackerspace'
  });
});

// Board Dashboard
router.get('/board-dashboard', (req, res) => {
  res.render('pages/board-dashboard', {
    title: 'Board Dashboard',
    activePage: 'Hackerspace'
  });
});

// API endpoint to fetch Printables user stats
router.get('/api/printables-stats', async (req, res) => {
  try {
    const userId = 195493;

    // Query to fetch user profile data with print stats
    const query = `
      query UserProfile($id: ID!) {
        user(id: $id) {
          id
          publicUsername
          handle
          publishedPrintsCount
          latestPublishedPrints {
            id
            downloadCount
            likesCount
          }
          badgesProfileLevel {
            profileLevel
          }
        }
      }
    `;

    const response = await fetch('https://api.printables.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US'
      },
      body: JSON.stringify({
        operationName: 'UserProfile',
        query: query,
        variables: { id: userId }
      })
    });

    const data = await response.json();

    // Aggregate download and like counts from prints
    if (data.data && data.data.user && data.data.user.latestPublishedPrints) {
      const prints = data.data.user.latestPublishedPrints;
      const totalDownloads = prints.reduce((sum, print) => sum + (print.downloadCount || 0), 0);
      const totalLikes = prints.reduce((sum, print) => sum + (print.likesCount || 0), 0);

      data.data.user.totalDownloads = totalDownloads;
      data.data.user.totalLikes = totalLikes;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching Printables stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
 
