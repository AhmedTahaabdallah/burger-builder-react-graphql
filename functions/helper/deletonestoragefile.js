exports.deletOneStorageFile =  async function deletOneStorageFile(bucket, url) {
    let pathh = url.replace('https://storage.googleapis.com/download/storage/v1/b/burger-builder-react-eb8cd.appspot.com/o/', '');
    const list = pathh.split("?");
    pathh = list[0];
    pathh = pathh.replace(/%2F/g, '/');
    console.log(`final pathh : ${pathh}`);
    const resultt3 = await deleteBucket(bucket, pathh);
    return resultt3;
}

async function deleteBucket(bucket, bucketName) {
    const file = bucket.file(bucketName);
    try {
        await file.delete();
        console.log(`Successfully deleted ${bucketName}`);
        return true;
    } catch (error) {
        console.error(`Failed to remove photo, error: ${error}`);
        return false;
    }
}