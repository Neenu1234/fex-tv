# Adding Demo Video to GitHub

## Option 1: Upload to YouTube/Vimeo (Recommended)

### Steps:
1. Upload your `.mov` file to YouTube or Vimeo
2. Get the video URL
3. Add link to README.md

**Advantages:**
- No file size limits
- Easy to embed
- Better for sharing with professor
- Professional presentation

### Update README.md:
```markdown
## 🎥 Demo Video

[![Demo Video](https://img.shields.io/badge/▶️-Watch%20Demo-red)](YOUR_YOUTUBE_URL_HERE)

**👉 [Watch Full Demo](YOUR_YOUTUBE_URL_HERE)**
```

---

## Option 2: GitHub Releases (For files < 2GB)

### Steps:
1. Go to your GitHub repo: https://github.com/Neenu1234/fex-tv
2. Click "Releases" → "Create a new release"
3. Upload your `.mov` file as an asset
4. Copy the download URL
5. Add link to README.md

---

## Option 3: Git LFS (For large files)

If file is > 100MB, use Git Large File Storage:

```bash
# Install Git LFS (if not installed)
brew install git-lfs

# Initialize LFS
cd /Users/neenubonny/Downloads/fex-tv
git lfs install

# Track video files
git lfs track "*.mov"
git lfs track "*.mp4"

# Add and commit
git add .gitattributes
git add ~/Desktop/your-video.mov
git commit -m "Add demo video"
git push
```

---

## Quick Command to Add Video

If your video is < 100MB, you can add it directly:

```bash
cd /Users/neenubonny/Downloads/fex-tv
cp ~/Desktop/your-video.mov demo-video.mov
git add demo-video.mov
git commit -m "Add demo video"
git push
```

Then update README.md with the video link.

---

## Recommended: YouTube Upload

1. Go to https://www.youtube.com/upload
2. Upload your `.mov` file
3. Set visibility (Unlisted is good for sharing with professor)
4. Copy the video URL
5. Add to README.md

This is the easiest and most professional option!

