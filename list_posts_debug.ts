
import { adminDb } from './src/lib/firebase/admin';

async function listPosts() {
    try {
        console.log("Listing posts from 'posts' collection...");
        const snapshot = await adminDb.collection('posts').get();
        if (snapshot.empty) {
            console.log("No posts found.");
        } else {
            snapshot.docs.forEach(doc => {
                console.log(`ID: ${doc.id}, Status: ${doc.data().status}, Title: ${doc.data().title}, PublishedAt: ${doc.data().publishedAt}`);
            });
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

listPosts();
