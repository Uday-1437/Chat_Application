import './addUser.css';
import avatar from "../../../../Assets/avatar.png";
import { useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from 'react-toastify';

export default function AddUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const username = formData.get("username");

        if (!username.trim()) {
            toast.error("Please enter a username.");
            setLoading(false);
            return;
        }

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            } else {
                toast.info("User not found");
                setUser(null);
            }
        } catch (err) {
            console.error("Error searching for user:", err);
            toast.error("Error searching for user");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        setLoading(true);

        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userChats");

        if (!user || !currentUser) {
            console.error('User or current user is not defined');
            setLoading(false);
            return;
        }

        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            const userChatsDocRef = doc(userChatsRef, user.id);
            const userChatsDocSnap = await getDoc(userChatsDocRef);

            if (!userChatsDocSnap.exists()) {
                await setDoc(userChatsDocRef, {
                    chats: []
                });
            }

            await updateDoc(userChatsDocRef, {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now()
                })
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now()
                })
            });

            toast.success("User added and chat created");
            setUser(null);
        } catch (err) {
            console.error('Error adding user:', err);
            toast.error("Error adding user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder='Username' name='username' />
                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>
            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={user.avatar || avatar} alt="User Avatar" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd} disabled={loading}>
                        {loading ? "Adding..." : "Add User"}
                    </button>
                </div>
            )}
        </div>
    );
}
