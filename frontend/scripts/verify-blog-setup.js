#!/usr/bin/env node

/**
 * Blog Setup Verification Script
 * 
 * This script checks that all required files and directories for the blog feature
 * are present and properly configured.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths relative to the project root
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const blogDir = path.join(projectRoot, 'app/blog');

console.log('Verifying blog setup...');

// Check for required directories
const requiredDirs = [
  { path: blogDir, name: 'Blog directory' },
  { path: path.join(blogDir, '[id]'), name: 'Blog post directory' },
  { path: path.join(publicDir, 'blog'), name: 'Blog images directory' },
  { path: path.join(publicDir, 'avatars'), name: 'Avatar images directory' }
];

let allDirsExist = true;
for (const dir of requiredDirs) {
  if (fs.existsSync(dir.path)) {
    console.log(`✅ ${dir.name} exists: ${dir.path}`);
  } else {
    console.log(`❌ ${dir.name} is missing: ${dir.path}`);
    allDirsExist = false;
  }
}

// Check for required files
const requiredFiles = [
  { path: path.join(blogDir, 'layout.tsx'), name: 'Blog layout' },
  { path: path.join(blogDir, 'page.tsx'), name: 'Blog listing page' },
  { path: path.join(blogDir, '[id]/page.tsx'), name: 'Blog post page' }
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} exists: ${file.path}`);
  } else {
    console.log(`❌ ${file.name} is missing: ${file.path}`);
    allFilesExist = false;
  }
}

// Check for blog post images
const blogImages = [];
for (let i = 1; i <= 6; i++) {
  blogImages.push(`post-${i}.jpg`);
}

let allBlogImagesExist = true;
for (const image of blogImages) {
  const imagePath = path.join(publicDir, 'blog', image);
  if (fs.existsSync(imagePath)) {
    console.log(`✅ Blog image exists: ${image}`);
  } else {
    console.log(`❌ Blog image is missing: ${image}`);
    allBlogImagesExist = false;
  }
}

// Check for avatar images
const avatarImages = [];
for (let i = 1; i <= 6; i++) {
  avatarImages.push(`avatar-${i}.jpg`);
}

let allAvatarImagesExist = true;
for (const image of avatarImages) {
  const imagePath = path.join(publicDir, 'avatars', image);
  if (fs.existsSync(imagePath)) {
    console.log(`✅ Avatar image exists: ${image}`);
  } else {
    console.log(`❌ Avatar image is missing: ${image}`);
    allAvatarImagesExist = false;
  }
}

// Check for Header component with Blog link
const headerPath = path.join(projectRoot, 'components/Header.tsx');
let headerHasBlogLink = false;

if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  if (headerContent.includes('href="/blog"')) {
    console.log('✅ Header component has Blog link');
    headerHasBlogLink = true;
  } else {
    console.log('❌ Header component is missing Blog link');
  }
} else {
  console.log('❌ Header component file is missing');
}

// Summary
console.log('\n--- Blog Setup Verification Summary ---');
if (allDirsExist && allFilesExist && allBlogImagesExist && allAvatarImagesExist && headerHasBlogLink) {
  console.log('✅ All blog components are properly set up!');
} else {
  console.log('❌ Some blog components are missing or incorrectly configured.');
  console.log('Please check the issues above and fix them before proceeding.');
}

console.log('\nNext steps:');
console.log('1. Run the development server: npm run dev');
console.log('2. Visit http://localhost:3000/blog to see the blog listing page');
console.log('3. Click on a blog post to view the individual post page');
console.log('4. Test search and filtering functionality');
console.log('5. Verify responsive design on different screen sizes'); 