const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Home',
    activePage: 'Home'
  });
});

// Bachelor project
router.get('/bachelor-project', (req, res) => {
  res.render('pages/bachelor-project', {
    title: 'Bachelor Project',
    activePage: 'Bachelor project'
  });
});

// Master thesis
router.get('/master-thesis', (req, res) => {
  res.render('pages/master-thesis', {
    title: 'Master Thesis',
    activePage: 'Master thesis'
  });
});

// Art Path
router.get('/art-path', (req, res) => {
  res.render('pages/art-path', {
    title: '(Sm)Art Path',
    activePage: '(Sm)Art Path'
  });
});

// Scene generation
router.get('/scene-generation', (req, res) => {
  res.render('pages/scene-generation', {
    title: 'Scene Generation',
    activePage: 'Scene generation'
  });
});

// Quarkus project
router.get('/quarkus', (req, res) => {
  res.render('pages/quarkus', {
    title: 'Quarkus Project',
    activePage: 'Quarkus project'
  });
});

// Virtual army
router.get('/virtual-army', (req, res) => {
  res.render('pages/virtual-army', {
    title: 'Virtual Army',
    activePage: 'Virtual army'
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

module.exports = router;
