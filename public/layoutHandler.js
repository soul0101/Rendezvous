export default () => {
    const mainWindow = document.getElementsByClassName('main-video');
    const videoGrid = document.getElementById('video-grid');
    const aspectRatio = 4/3
    const screenWidth = $('.main-video').width();
    const screenHeight = $('.main-video').height();
    console.log(screenHeight, screenWidth);
    const videoCount = document.getElementsByTagName('video').length;

    const calculateLayout = (containerWidth, containerHeight, videoCount, aspectRatio) => {
        let bestLayout = {
            area: 0,
            cols: 0,
            rows: 0,
            width: 0,
            height: 0
        };
    
        for(let cols = 1; cols <= videoCount; cols++){
            const rows = Math.ceil(videoCount / cols);
            let width;
            let height;
            const hScale = containerWidth / (cols * aspectRatio);
            const vScale = containerHeight / rows;
            if (hScale <= vScale) {
                width = Math.floor(containerWidth / cols);
                height = Math.floor(width / aspectRatio);
            } else {
                height = Math.floor(containerHeight / rows);
                width = Math.floor(height * aspectRatio);
            }
            const area = width * height;
            if (area > bestLayout.area && videoCount * area < containerHeight * containerWidth) {
                bestLayout = {
                area,
                width,
                height,
                rows,
                cols
                };
            }
        }
        return bestLayout;
    }

    const { width, height, cols, rows} = calculateLayout(
        screenWidth,
        screenHeight,
        videoCount,
        aspectRatio
    );

    videoGrid.style.setProperty("--width", width + "px");
    videoGrid.style.setProperty("--height", height + "px");
    videoGrid.style.setProperty("--cols", cols + "");
    videoGrid.style.setProperty("--rows", rows + "");
};
