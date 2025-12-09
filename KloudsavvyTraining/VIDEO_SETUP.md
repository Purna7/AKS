# Video Setup Guide for KloudsavvyTraining

## Current Setup

The application currently uses **publicly available sample videos** from Google Cloud Storage for demonstration purposes. These are placeholder videos that allow you to test the video player functionality.

## Sample Videos Being Used

The application cycles through these 5 sample videos:
1. Big Buck Bunny
2. Elephants Dream
3. For Bigger Blazes
4. For Bigger Escapes
5. For Bigger Fun

All videos are served via HTTPS from Google's CDN and work across all modern browsers.

## How to Add Your Own Videos

### Option 1: Local Videos (Development Only)

1. **Place video files** in the `videos/` directory:
   ```
   videos/
   ├── docker-intro.mp4
   ├── kubernetes-basics.mp4
   └── aws-fundamentals.mp4
   ```

2. **Update the CoursesController.cs** to reference local files:
   ```csharp
   VideoUrl = $"/videos/course{course.CourseId}_video{i}.mp4"
   ```

3. **Add MIME type** in Web.config:
   ```xml
   <staticContent>
     <mimeMap fileExtension=".mp4" mimeType="video/mp4" />
   </staticContent>
   ```

### Option 2: Azure Media Services (Recommended for Production)

1. **Create Azure Media Services account**
2. **Upload videos** using Azure Portal or Storage Explorer
3. **Create Streaming Endpoint**
4. **Update VideoUrl** with Azure streaming URL:
   ```csharp
   VideoUrl = "https://youraccount.streaming.mediaservices.windows.net/video.mp4"
   ```

### Option 3: AWS S3 + CloudFront

1. **Create S3 bucket** for video storage
2. **Upload videos** to S3
3. **Configure CloudFront** distribution
4. **Update VideoUrl** with CloudFront URL:
   ```csharp
   VideoUrl = "https://d123456.cloudfront.net/videos/lecture1.mp4"
   ```

### Option 4: YouTube Embed

1. **Upload videos** to YouTube (unlisted)
2. **Get embed URL** from YouTube
3. **Modify the video player** view to use iframe:
   ```html
   <iframe width="100%" height="500" 
           src="https://www.youtube.com/embed/VIDEO_ID" 
           frameborder="0" allowfullscreen>
   </iframe>
   ```

### Option 5: Vimeo

1. **Upload videos** to Vimeo
2. **Set privacy** to "Hide from Vimeo"
3. **Get video URL** from Vimeo
4. **Update VideoUrl** with Vimeo player URL

## Video Specifications

For best results, prepare your videos with these settings:

### Recommended Settings
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Frame Rate**: 30fps
- **Bitrate**: 5-8 Mbps for 1080p, 2.5-4 Mbps for 720p
- **Audio**: AAC codec, 128kbps, 44.1kHz

### Converting Videos with FFmpeg

```bash
# Convert to optimized MP4
ffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k output.mp4

# Create multiple quality versions
ffmpeg -i input.mov -c:v libx264 -b:v 5M -s 1920x1080 hd.mp4
ffmpeg -i input.mov -c:v libx264 -b:v 2.5M -s 1280x720 sd.mp4
```

## Database Integration

To store video metadata in database:

1. **Run the schema** in `Database/Schema.sql`
2. **Update Controllers** to read from database instead of static data
3. **Create upload interface** for instructors
4. **Store video URL** in database after upload

## Testing Videos

Current sample videos allow you to:
- ✓ Test video player functionality
- ✓ Test preview (free) vs locked videos
- ✓ Test playlist navigation
- ✓ Test progress tracking
- ✓ Verify responsive design

## Next Steps

1. **Choose your video hosting solution** (Azure, AWS, YouTube, or local)
2. **Record or prepare your course videos**
3. **Upload videos** to chosen platform
4. **Update CoursesController.cs** with actual video URLs
5. **Test playback** across different devices and browsers
6. **Consider implementing**:
   - Video transcoding for multiple quality levels
   - Adaptive bitrate streaming (HLS/DASH)
   - Progress tracking and resume functionality
   - Download options for offline viewing
   - Closed captions/subtitles support

## Security Considerations

For production deployment:
- Use **signed URLs** with expiration for premium content
- Implement **token-based authentication** for video access
- Enable **DRM protection** for high-value content
- Set up **CDN caching** for better performance
- Monitor **bandwidth usage** and costs

## Support

For questions about video setup, refer to:
- Azure Media Services: https://docs.microsoft.com/azure/media-services/
- AWS CloudFront: https://docs.aws.amazon.com/cloudfront/
- FFmpeg Documentation: https://ffmpeg.org/documentation.html
