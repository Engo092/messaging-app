import { useOutletContext } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import '../styles/FriendList.css';
import Chat from './Chat';

function FriendList() {
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState("");
    const [isInChat, setIsInChat] = useState(false);
    const [friendInChat, setFriendInChat] = useState(null);

    const { serverResponse: serverResponse, setNewServerResponse: setNewServerResponse } = useOutletContext();
    const searchRef = useRef();

    useEffect(() => {
        setStatus(serverResponse.user.status);
    }, []);

    useEffect(() => {
        const friends = document.querySelectorAll(".friendSelector");

        friends.forEach((friend) => {
            friend.addEventListener("click", () => friendHandler(friend));
        });
        
        // Prevents listeners adding up and creating performance issues
        return () => {
            friends.forEach((friend) => {
                friend.removeEventListener("click", () => friendHandler(friend));
            });
        }
    });
    
    const searchHandler = async (e) => {
        e.preventDefault();
    
        const search = searchRef.current.value;
        
        try {
            const reqResponse = await fetch("http://localhost:3000/api/search", {
                method: "post",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: search,
                }),
            });
            const response = await reqResponse.json();
            if (response.message !== "User found") {
                alert(`${response.message}`);
            } else {
                setNewServerResponse();
            }
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const submitEdit = async (e) => {
        e.preventDefault();

        try {
            const reqResponse = await fetch("http://localhost:3000/api/status", {
                method: "post",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: status,
                }),
            });
            setIsEditing(false);
            setNewServerResponse();
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const cancelEdit = () => {
        setStatus(serverResponse.user.status);
        setIsEditing(false);
    }

    const friendHandler = (friend) => {
        document.querySelectorAll(".selected").forEach((e) => {
            e.classList.remove("selected");
        });
        setIsEditing(false);
        setIsInChat(true);
        setFriendInChat(friend.id);
        
        friend.classList.add("selected");
    }

    return (
        <>
            <div className='friendList'>
                <div className='searchFriend'>
                    <form onSubmit={searchHandler}>
                        <input type="search" className='searchInput' placeholder='Add a friend email' ref={searchRef} required />
                        <button type='submit' className='searchSubmit'>Search</button>
                    </form>
                </div>
                <div className='allFriends'>
                    {serverResponse.friends && serverResponse.friends.length > 0 ? (
                        serverResponse.friends.map((friend) => {
                            return (
                                <div className='friendSelector' key={friend._id} id={friend._id}>
                                    <div className='friendNames'>
                                        <h3>{friend.username}</h3>
                                        <h4>{friend.email}</h4>
                                    </div>
                                    <p className='friendStatus'>{friend.status}</p>
                                </div>
                            );
                        })
                    ) : (
                        <div className='noFriendsMessage'>
                            <p>It looks like you have no friends yet. Search a friend's email to add it!</p>
                        </div>
                    )}
                </div>
            </div>
            {!isInChat ? (
                <>
                    <div className='chatBox'>
                        <h2>{serverResponse.user.username}</h2>
                        <h3 className='userEmail'>{serverResponse.user.email}</h3>
                        <div className='status'>
                            <h3>Status: </h3>
                            {!isEditing ? (
                                <>
                                    {serverResponse.user.status.trim() === "" ? (
                                        <p>You have no status.</p>
                                    ) : (
                                        <p>{status}</p>
                                    )}
                                    <button onClick={e => {e.preventDefault(); setIsEditing(true)}} className='editStatus'>Edit Status</button>
                                </>
                            ) : (
                                <form onSubmit={(e) => submitEdit(e)}>
                                    <p>* Status must be max. 20 characters</p>
                                    <input type="text" className='statusInput' maxLength={20} value={status} onChange={e => setStatus(e.target.value)} />
                                    <button type='submit' className='submitStatus'>Submit</button>
                                    <button onClick={cancelEdit} className='cancelStatus'>Cancel</button>
                                </form>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <Chat 
                    closeChat={() => {
                        setIsInChat(false);
                        setFriendInChat(undefined);
                        document.querySelectorAll(".selected").forEach((e) => {
                            e.classList.remove("selected");
                        });
                    }}
                    friend = {friendInChat}
                />
            )}
        </>
    );
}

export default FriendList;