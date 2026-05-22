import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './supabaseClient'
import logo from './assets/findformelogo.png'
import './styles.css'

const CATEGORIES = [
'All',
'ISO / Items Wanted',
'Handywork',
'Odd Jobs',
'Pickup & Delivery',
'Business Needs',
'Home Services',
'Open Again',
]

const USER_INTENTS = [
'I need something found',
'I want to make money finding things',
'I offer labor or services',
'I’m a business',
]

function Logo() {
return (
<div className="logo-container">
<img src={logo} alt="FindForMe Logo" className="logo-image" />
</div>
)
}

function urgencyClass(urgency) {
if (urgency === 'Immediately') return 'info-pill urgency-now'
if (urgency === 'By a certain date') return 'info-pill urgency-soon'
return 'info-pill urgency-normal'
}

function statusLabel(status) {
if (status === 'in_progress') return 'In Progress'
if (status === 'completed') return 'Completed'
if (status === 'cancelled') return 'Cancelled'
return 'Open'
}

function PhotoCarousel({ images }) {
const cleanImages = images?.filter(Boolean) || []

if (cleanImages.length === 0) return null

return (
<div className="image-carousel">
{cleanImages.map((url, index) => (
<img key={index} src={url} className="post-image" alt={`Post ${index + 1}`} />
))}
</div>
)
}

function App() {
const [profile, setProfile] = useState(null)
const [authModalOpen, setAuthModalOpen] = useState(false)
const [mode, setMode] = useState('login')

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [fullName, setFullName] = useState('')
const [phone, setPhone] = useState('')
const [birthday, setBirthday] = useState('')
const [userIntent, setUserIntent] = useState('I need something found')
const [message, setMessage] = useState('')

function requireLogin() {
setMode('login')
setAuthModalOpen(true)
}

async function loadProfile(userEmail) {
const { data, error } = await supabase
.from('profiles')
.select('*')
.eq('email', userEmail)
.limit(1)
.maybeSingle()

if (error || !data) {
setMessage('Login worked, but no profile was found for this email.')
return
}

setProfile(data)
setAuthModalOpen(false)
}

async function handleSignup() {
if (!email || !password || !fullName || !phone || !birthday || !userIntent) {
setMessage('Please fill out all fields.')
return
}

const { error: signupError } = await supabase.auth.signUp({ email, password })

if (signupError) {
setMessage(signupError.message)
return
}

const { error: profileError } = await supabase.from('profiles').insert([
{
email,
full_name: fullName,
phone,
birthday,
role: 'customer',
user_intent: userIntent,
},
])

if (profileError) {
setMessage(profileError.message)
return
}

setMessage('Account created. Now log in.')
setMode('login')
}

async function handleLogin() {
const { error } = await supabase.auth.signInWithPassword({ email, password })

if (error) {
setMessage(error.message)
return
}

await loadProfile(email)
}

async function handleLogout() {
await supabase.auth.signOut()
setProfile(null)
setEmail('')
setPassword('')
setFullName('')
setPhone('')
setBirthday('')
setUserIntent('I need something found')
setMode('login')
setMessage('')
}

return (
<>
<Dashboard
profile={profile}
setProfile={setProfile}
onLogout={handleLogout}
requireLogin={requireLogin}
/>

{authModalOpen && (
<div className="auth-gate-overlay">
<div className="auth-gate-card">
<button className="auth-close" onClick={() => setAuthModalOpen(false)}>
×
</button>

<Logo />

<h2>Join FindForMe to continue</h2>
<p className="status-message">
Browse freely. Create an account to bid, save, post, chat, or view offers.
</p>

{mode === 'login' && (
<>
<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
<button onClick={handleLogin}>Login</button>
<button className="secondary-button" onClick={() => { setMode('signup'); setMessage('') }}>
Create Account
</button>
</>
)}

{mode === 'signup' && (
<>
<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" />
<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
<input value={birthday} onChange={e => setBirthday(e.target.value)} type="date" />
<input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
<input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />

<div className="onboarding-box">
<h3>What are you here to do?</h3>
<p>This helps FindForMe personalize your experience.</p>

<div className="intent-grid">
{USER_INTENTS.map(intent => (
<button
key={intent}
type="button"
className={userIntent === intent ? 'intent-pill active-pill' : 'intent-pill'}
onClick={() => setUserIntent(intent)}
>
{intent}
</button>
))}
</div>
</div>

<button onClick={handleSignup}>Sign Up</button>
<button className="secondary-button" onClick={() => { setMode('login'); setMessage('') }}>
Back to Login
</button>
</>
)}

<p className="status-message">{message}</p>
</div>
</div>
)}
</>
)
}

function Dashboard({ profile, setProfile, onLogout, requireLogin }) {
const [view, setView] = useState('home')
const [menuOpen, setMenuOpen] = useState(false)
const [notificationsOpen, setnotificationsOpen] = useState(false)
const [selectedCategory, setSelectedCategory] = useState('All')
const [selectedUser, setSelectedUser] = useState(null)
const [selectedPost, setSelectedPost] = useState(null)

const [negotiatingBid, setNegotiatingBid] = useState(null)
const [counterPrice, setCounterPrice] = useState('')

const [posts, setPosts] = useState([])
const [bids, setBids] = useState([])
const [messages, setMessages] = useState([])
const [profiles, setProfiles] = useState([])
const [reviews, setReviews] = useState([])
const [savedRequests, setSavedRequests] = useState([])
const [notifications, setNotifications] = useState([])

const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [category, setCategory] = useState('ISO / Items Wanted')
const [location, setLocation] = useState('')
const [budget, setBudget] = useState('')
const [urgency, setUrgency] = useState('No rush')
const [postImages, setPostImages] = useState([])

const [activeBidPostId, setActiveBidPostId] = useState(null)
const [activeChatPostId, setActiveChatPostId] = useState(null)
const [bidPrice, setBidPrice] = useState('')
const [bidMessage, setBidMessage] = useState('')
const [bidImage, setBidImage] = useState(null)
const [newMessage, setNewMessage] = useState('')

const [status, setStatus] = useState('')
const [reviewModal, setReviewModal] = useState(null)
const [rating, setRating] = useState(5)
const [reviewComment, setReviewComment] = useState('')

function displayName(email) {
const found = profiles.find(p => p.email === email)
return found?.full_name || email || 'Unknown User'
}

function getAvatar(email) {
const found = profiles.find(p => p.email === email)

if (found?.avatar_url) {
return <img src={found.avatar_url} className="avatar-img" alt="Profile" />
}

const name = found?.full_name || email
return name?.charAt(0)?.toUpperCase() || '?'
}

function averageRating(email) {
const userReviews = reviews.filter(r => r.reviewee_email === email)

if (userReviews.length === 0) return 'No ratings yet'

const avg =
userReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
userReviews.length

return `${avg.toFixed(1)} ⭐ (${userReviews.length} rated listing${userReviews.length === 1 ? '' : 's'})`
}

function isPostSaved(postId) {
if (!profile) return false

return savedRequests.some(
saved => saved.post_id === postId && saved.user_email === profile.email
)
}

function savedCount(postId) {
return savedRequests.filter(saved => saved.post_id === postId).length
}

async function addNotification(text, targetEmail = null) {
const recipient = targetEmail || profile?.email

if (!recipient) return

await supabase.from('notifications').insert([
{
user_email: recipient,
text,
read: false,
},
])
}

async function markNotificationRead(notificationId) {
if (!profile) return

const { error } = await supabase
.from('notifications')
.update({ read: true })
.eq('id', notificationId)
.eq('user_email', profile.email)

if (error) {
alert(error.message)
return
}

loadData()
}

function gatedAction(action) {
if (!profile) {
requireLogin()
return
}

action()
}

async function loadData() {
const { data: postsData } = await supabase
.from('posts')
.select('*')
.order('created_at', { ascending: false })

const { data: bidsData } = await supabase
.from('bids')
.select('*')

const { data: messagesData } = await supabase
.from('messages')
.select('*')
.order('created_at', { ascending: true })

const { data: profilesData } = await supabase
.from('profiles')
.select('*')

const { data: reviewsData } = await supabase
.from('reviews')
.select('*')

const { data: savedData } = await supabase
.from('saved_requests')
.select('*')

const { data: notificationData } = await supabase
.from('notifications')
.select('*')
.eq('user_email', profile?.email)
.order('created_at', { ascending: false })

setPosts(postsData || [])
setBids(bidsData || [])
setMessages(messagesData || [])
setProfiles(profilesData || [])
setReviews(reviewsData || [])
setSavedRequests(savedData || [])
setNotifications(notificationData || [])
}

async function uploadImage(file) {
if (!file) return null

const fileName = `${Date.now()}-${file.name}`

const { error } = await supabase.storage
.from('findforme-images')
.upload(fileName, file, { upsert: true })

if (error) {
alert(error.message)
return null
}

const { data } = supabase.storage
.from('findforme-images')
.getPublicUrl(fileName)

return data.publicUrl
}

async function uploadImages(files) {
if (!files || files.length === 0) return []

const uploadedUrls = []

for (const file of files) {
const url = await uploadImage(file)

if (url) {
uploadedUrls.push(url)
}
}

return uploadedUrls
}

async function uploadAvatar(file) {
if (!file || !profile) return null

const avatarUrl = await uploadImage(file)

if (!avatarUrl) return null

const { error: updateError } = await supabase
.from('profiles')
.update({ avatar_url: avatarUrl })
.eq('email', profile.email)

if (updateError) {
alert(updateError.message)
return null
}

setProfile(prev => ({
...prev,
avatar_url: avatarUrl,
}))

loadData()

return avatarUrl
}

async function createPost() {
if (!profile) {
requireLogin()
return
}

if (!title || !description) {
setStatus('Please add a title and description.')
return
}

const imageUrls = await uploadImages(postImages)

const { error } = await supabase.from('posts').insert([
{
user_email: profile.email,
title,
description,
category,
location: location || 'Not listed',
budget: budget || 'Not listed',
urgency,
image_url: imageUrls[0] || null,
image_urls: imageUrls,
status: 'open',
},
])

if (error) {
setStatus(error.message)
return
}

setTitle('')
setDescription('')
setCategory('ISO / Items Wanted')
setLocation('')
setBudget('')
setUrgency('No rush')
setPostImages([])
setStatus('')
setView('home')

loadData()
}

async function toggleSaveRequest(postId) {
if (!profile) {
requireLogin()
return
}

const existing = savedRequests.find(
saved =>
saved.post_id === postId &&
saved.user_email === profile.email
)

if (existing) {
const { error } = await supabase
.from('saved_requests')
.delete()
.eq('id', existing.id)

if (error) {
alert(error.message)
return
}

loadData()
return
}

const { error } = await supabase
.from('saved_requests')
.insert([
{
user_email: profile.email,
post_id: postId,
},
])

if (error) {
alert(error.message)
return
}

loadData()
}

async function submitBid(postId) {
if (!profile) {
requireLogin()
return
}

if (!bidPrice || !bidMessage) {
alert('Please add a price and message.')
return
}

const imageUrl = await uploadImage(bidImage)

const { error } = await supabase
.from('bids')
.insert([
{
post_id: postId,
user_email: profile.email,
price: bidPrice,
message: bidMessage,
image_url: imageUrl,
status: 'open',
counter_count: 0,
final_offer: false,
},
])

if (error) {
alert(error.message)
return
}

const post = posts.find(p => p.id === postId)

if (post?.user_email && post.user_email !== profile.email) {
await addNotification(
`${profile.full_name || profile.email} submitted an offer on your request: ${post.title}`,
post.user_email
)
}

setBidPrice('')
setBidMessage('')
setBidImage(null)
setActiveBidPostId(null)

loadData()
}

async function acceptBid(postId, bidId) {
if (!profile) {
requireLogin()
return
}

const { error } = await supabase
.from('posts')
.update({
accepted_bid_id: bidId,
status: 'in_progress',
})
.eq('id', postId)

if (error) {
alert(error.message)
return
}

const post = posts.find(p => p.id === postId)
const acceptedBid = bids.find(b => b.id === bidId)

if (
post &&
acceptedBid?.user_email &&
acceptedBid.user_email !== profile.email
) {
await addNotification(
`Your offer was accepted on: ${post.title}`,
acceptedBid.user_email
)
}

setActiveChatPostId(postId)
setNewMessage('Hey! I accepted your offer. Let’s coordinate 👍')

loadData()
}

async function updatePostStatus(postId, newStatus) {
if (!profile) {
requireLogin()
return
}

const updateData =
newStatus === 'open'
? { status: 'open', accepted_bid_id: null }
: { status: newStatus }

const { error } = await supabase
.from('posts')
.update(updateData)
.eq('id', postId)

if (error) {
alert(error.message)
return
}

loadData()
}

async function sendCounterOffer(bid) {
if (!counterPrice) {
alert('Please enter a counter price.')
return
}

const currentCount = bid.counter_count || 0

if (currentCount >= 2) {
alert('This offer is already marked as final.')
return
}

const isFinal = currentCount + 1 >= 2

const { error } = await supabase
.from('bids')
.update({
price: counterPrice,
status: 'counter_requested',
counter_count: currentCount + 1,
final_offer: isFinal,
})
.eq('id', bid.id)

if (error) {
alert(error.message)
return
}

const post = posts.find(p => p.id === bid.post_id)

await addNotification(
`You received a counter offer on: ${post?.title || 'a request'}`,
bid.user_email
)

setCounterPrice('')
setNegotiatingBid(null)

loadData()
}

async function submitReview() {
if (!profile) {
requireLogin()
return
}

if (!reviewModal) return

const alreadyReviewed = reviews.some(
r =>
r.post_id === reviewModal.postId &&
r.reviewer_email === profile.email &&
r.reviewee_email === reviewModal.revieweeEmail
)

if (alreadyReviewed) {
alert('You already reviewed this user for this deal.')
return
}

const { error } = await supabase.from('reviews').insert([
{
post_id: reviewModal.postId,
reviewer_email: profile.email,
reviewee_email: reviewModal.revieweeEmail,
rating,
comment: reviewComment,
},
])

if (error) {
alert(error.message)
return
}

setReviewModal(null)
setRating(5)
setReviewComment('')

loadData()
}

async function sendMessage(postId, acceptedBid, postOwnerEmail) {
if (!profile) {
requireLogin()
return
}

if (!newMessage) return

const allowed =
profile.email === postOwnerEmail ||
profile.email === acceptedBid?.user_email

if (!allowed) {
alert('Only the post owner and accepted bidder can message.')
return
}

const { error } = await supabase.from('messages').insert([
{
post_id: postId,
user_email: profile.email,
message: newMessage,
},
])

if (error) {
alert(error.message)
return
}

const recipient =
profile.email === postOwnerEmail
? acceptedBid?.user_email
: postOwnerEmail

if (recipient) {
await addNotification('You received a new message about a deal.', recipient)
}

setNewMessage('')

loadData()
}

useEffect(() => {
loadData()

const postsSub = supabase
.channel('posts-live')
.on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
loadData()
})
.subscribe()

const bidsSub = supabase
.channel('bids-live')
.on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => {
loadData()
})
.subscribe()

const messagesSub = supabase
.channel('messages-live')
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
loadData()
})
.subscribe()

const savedSub = supabase
.channel('saved-live')
.on('postgres_changes', { event: '*', schema: 'public', table: 'saved_requests' }, () => {
loadData()
})
.subscribe()

return () => {
supabase.removeChannel(postsSub)
supabase.removeChannel(bidsSub)
supabase.removeChannel(messagesSub)
supabase.removeChannel(savedSub)
}
}, [profile])

const filteredPosts =
selectedCategory === 'All'
? posts
: posts.filter(post => post.category === selectedCategory)

const mySavedPostIds = profile
? savedRequests.filter(saved => saved.user_email === profile.email).map(saved => saved.post_id)
: []

const savedPosts = posts.filter(post => mySavedPostIds.includes(post.id))

const activeCategoryPosts = filteredPosts.filter(
post => post.status !== 'completed' && post.status !== 'cancelled'
)

const urgentPosts = posts.filter(
post => post.urgency === 'Immediately' && post.status !== 'in_progress'
)

const highValuePosts = posts.filter(post => {
const amount = Number(String(post.budget || '').replace(/[^0-9.]/g, ''))
return amount >= 100
})

const newTodayPosts = posts.slice(0, 5)

const feedProps = {
bids,
messages,
profile,
displayName,
getAvatar,
averageRating,
activeBidPostId,
setActiveBidPostId,
activeChatPostId,
setActiveChatPostId,
bidPrice,
setBidPrice,
bidMessage,
setBidMessage,
setBidImage,
submitBid,
acceptBid,
updatePostStatus,
negotiatingBid,
setNegotiatingBid,
counterPrice,
setCounterPrice,
sendCounterOffer,
newMessage,
setNewMessage,
sendMessage,
setReviewModal,
reviews,
isPostSaved,
savedCount,
toggleSaveRequest,
requireLogin,
setSelectedUser,
setSelectedPost,
}

return (
<div className="app-shell">
<div className="site-background"></div>

<div className="sticky-header">
<header className="topbar">

<button
className="menu-button"
onClick={() => setMenuOpen(!menuOpen)}
>
☰
</button>

{notificationsOpen && (
<div className="notifications-dropdown">

<div className="notifications-dropdown-header">
<h4>Notifications</h4>
<span>
{notifications.filter(n => !n.read).length} new
</span>
</div>

{notifications.length === 0 ? (
<p className="empty-notifications">
No notifications yet
</p>
) : (
notifications.slice(0, 6).map(note => (
<div
key={note.id}
className={
note.read
? 'dropdown-notification read'
: 'dropdown-notification unread'
}
onClick={() => {

    markNotificationRead(note.id)
setnotificationsOpen(false)
}}
>
<div className="notification-dot"></div>

<div className="dropdown-notification-content">
<p>{note.text}</p>
<span>
{note.read ? 'Viewed' : 'New'}
</span>
</div>
</div>
))
)}

</div>
)}

<Logo />

<div className="topbar-actions">

<button
className="notification-bell"
onClick={() => setnotificationsOpen( !notificationsOpen)}
>
🔔

{notifications.filter(n => !n.read).length > 0 && (
<span className="notification-badge">
{notifications.filter(n => !n.read).length}
</span>
)}
</button>

{profile && (
<button
className="profile-bubble"
onClick={() => setView('profile')}
>
{profile.full_name
? profile.full_name.charAt(0).toUpperCase()
: 'U'}
</button>
)}

</div>

</header>

<section className="category-strip">
{CATEGORIES.map(cat => (
<button
key={cat}
className={selectedCategory === cat ? 'category-pill active-pill' : 'category-pill'}
onClick={() => {
setSelectedCategory(cat)
setView('home')
}}
>
{cat}
</button>
))}
</section>
</div>

<section className="hero">
<p className="tagline">Don’t search. Just ask.</p>

<h1>
{selectedCategory === 'All'
? 'Post what you need. Let people compete to find it.'
: selectedCategory}
</h1>

<p>
{selectedCategory === 'All'
? 'Browse real requests. Create an account when you’re ready to bid, save, chat, or post.'
: `Showing ${activeCategoryPosts.length} active request${activeCategoryPosts.length === 1 ? '' : 's'} in ${selectedCategory}.`}
</p>

<button onClick={() => gatedAction(() => setView('post'))}>
Post an In Search Of
</button>
</section>

<p className="welcome">
{profile
? `Welcome, ${profile.full_name || profile.email} · ${averageRating(profile.email)}`
: 'Browse freely. Login to interact.'}
</p>


{menuOpen && (
<nav className="menu-card">
<button onClick={() => { setView('home'); setMenuOpen(false) }}>Home</button>
<button onClick={() => gatedAction(() => { setView('post'); setMenuOpen(false) })}>Post an In Search Of</button>
<button onClick={() => gatedAction(() => { setView('saved'); setMenuOpen(false) })}>Saved Requests ({savedPosts.length})</button>
{profile && <button onClick={() => { setView('profile'); setMenuOpen(false) }}>My Profile</button>}
{profile ? <button onClick={onLogout}>Logout</button> : <button onClick={requireLogin}>Login / Create Account</button>}
</nav>
)}

{view === 'home' && (
<>
{selectedCategory === 'All' && (
<section className="smart-sections">
<div className="smart-card">
<span>Urgent</span>
<strong>{urgentPosts.length}</strong>
<p>Needs marked immediate</p>
</div>

<div className="smart-card">
<span>High Budget</span>
<strong>{highValuePosts.length}</strong>
<p>Requests $100+</p>
</div>

<div className="smart-card">
<span>Saved</span>
<strong>{savedPosts.length}</strong>
<p>Your saved requests</p>
</div>

<div className="smart-card">
<span>New Today</span>
<strong>{newTodayPosts.length}</strong>
<p>Fresh requests</p>
</div>
</section>
)}

<section>
<div className="section-title-row">
<h2>{selectedCategory === 'All' ? 'Today’s Feed' : `${selectedCategory} Feed`}</h2>
<span>{filteredPosts.length} total</span>
</div>

<Feed posts={filteredPosts} {...feedProps} />
</section>
</>
)}

{view === 'saved' && profile && (
<section>
<div className="section-title-row">
<h2>Saved Requests</h2>
<span>{savedPosts.length} saved</span>
</div>

{savedPosts.length === 0 && (
<div className="empty-card">
<h3>No saved requests yet</h3>
<p>Tap “Save” on a request so you can come back to it later.</p>
<button onClick={() => setView('home')}>Browse Requests</button>
</div>
)}

<Feed posts={savedPosts} {...feedProps} />
</section>
)}

{view === 'post' && profile && (
<section className="form-card">
<h2>Create an In Search Of Post</h2>

<input
value={title}
onChange={e => setTitle(e.target.value)}
placeholder="What are you looking for?"
/>

<textarea
value={description}
onChange={e => setDescription(e.target.value)}
placeholder="Add details, examples, size, condition, timing, or anything that helps someone find it."
/>

<select value={category} onChange={e => setCategory(e.target.value)}>
{CATEGORIES.filter(cat => cat !== 'All').map(cat => (
<option key={cat}>{cat}</option>
))}
</select>

<input
value={location}
onChange={e => setLocation(e.target.value)}
placeholder="Location"
/>

<input
value={budget}
onChange={e => setBudget(e.target.value)}
placeholder="Exact budget, optional"
/>

<select value={urgency} onChange={e => setUrgency(e.target.value)}>
<option>Immediately</option>
<option>By a certain date</option>
<option>No rush</option>
</select>

<input
type="file"
accept="image/*"
multiple
onChange={e => setPostImages(Array.from(e.target.files))}
/>

<button onClick={createPost}>Submit Post</button>
<p>{status}</p>
</section>
)}

{view === 'notifications' && profile && (
<section className="form-card">
<div className="notification-panel-header">
<h2>Notifications</h2>
<span>{notifications.filter(n => !n.read).length} unread</span>
</div>

{notifications.length === 0 && (
<p className="status-message">No notifications yet.</p>
)}

{notifications.map(note => (
<div
key={note.id}
className={note.read ? 'notification-item read' : 'notification-item unread'}
onClick={() => markNotificationRead(note.id)}
>
<div className="notification-content">
<div className="notification-dot"></div>

<div className="notification-text">
<p>{note.text}</p>
<span>{note.read ? 'Read' : 'New'}</span>
</div>
</div>
</div>
))}
</section>
)}


{view === 'profile' && profile && (
<section className="form-card">
<h2>My Profile</h2>

<div className="profile-photo-row">
<div className="profile-photo-preview">
{profile.avatar_url ? (
<img src={profile.avatar_url} className="avatar-img" alt="Profile" />
) : (
<span>{profile.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
)}
</div>

<div>
<p><strong>Profile Picture</strong></p>
<input
type="file"
accept="image/*"
onChange={e => uploadAvatar(e.target.files[0])}
/>
</div>
</div>

<p><strong>Name:</strong> {profile.full_name}</p>
<p><strong>Email:</strong> {profile.email}</p>
<p><strong>Phone:</strong> {profile.phone}</p>
<p><strong>Birthday:</strong> {profile.birthday}</p>
<p><strong>Purpose:</strong> {profile.user_intent || 'Not selected'}</p>
<p><strong>Rating:</strong> {averageRating(profile.email)}</p>
<p><strong>Saved Requests:</strong> {savedPosts.length}</p>
</section>
)}

{reviewModal && (
<div className="review-overlay">
<div className="review-modal">
<h2>Rate Your Experience</h2>
<p>Review {displayName(reviewModal.revieweeEmail)}</p>

<div className="star-row">
{[1, 2, 3, 4, 5].map(star => (
<button
key={star}
className={rating >= star ? 'star active-star' : 'star'}
onClick={() => setRating(star)}
>
★
</button>
))}
</div>

<textarea
value={reviewComment}
onChange={e => setReviewComment(e.target.value)}
placeholder="Leave a short review..."
/>

<button onClick={submitReview}>Submit Review</button>

<button
className="secondary-button"
onClick={() => setReviewModal(null)}
>
Cancel
</button>
</div>
</div>
)}

{selectedUser && (
<div className="profile-overlay">
<div className="profile-modal">
<button
className="close-button"
onClick={() => setSelectedUser(null)}
>
✕
</button>

<div className="profile-header">
<div className="profile-avatar">
{getAvatar(selectedUser)}
</div>

<h2>{displayName(selectedUser)}</h2>
<p className="rating-text">{averageRating(selectedUser)}</p>
</div>

<div className="profile-trust-row">
<div className="profile-trust-box">
<strong>{posts.filter(p => p.user_email === selectedUser).length}</strong>
<span>Requests</span>
</div>

<div className="profile-trust-box">
<strong>{bids.filter(b => b.user_email === selectedUser).length}</strong>
<span>Offers</span>
</div>

<div className="profile-trust-box">
<strong>{posts.filter(p => p.user_email === selectedUser && p.status === 'completed').length}</strong>
<span>Completed</span>
</div>

<div className="profile-trust-box">
<strong>96%</strong>
<span>Response</span>
</div>
</div>

<div>
<h3>Recent Activity</h3>

{posts
.filter(p => p.user_email === selectedUser)
.slice(0, 5)
.map(p => (
<div key={p.id} className="mini-post">
<strong>{p.title}</strong>
<p>{p.description}</p>
</div>
))}
</div>

<button className="view-profile-button">
View Full Profile
</button>
</div>
</div>
)}

{selectedPost && (
<PostModal
selectedPost={selectedPost}
setSelectedPost={setSelectedPost}
bids={bids}
messages={messages}
profile={profile}
displayName={displayName}
getAvatar={getAvatar}
averageRating={averageRating}
acceptBid={acceptBid}
isPostSaved={isPostSaved}
toggleSaveRequest={toggleSaveRequest}
newMessage={newMessage}
setNewMessage={setNewMessage}
sendMessage={sendMessage}
setSelectedUser={setSelectedUser}
negotiatingBid={negotiatingBid}
setNegotiatingBid={setNegotiatingBid}
counterPrice={counterPrice}
setCounterPrice={setCounterPrice}
sendCounterOffer={sendCounterOffer}
/>
)}
</div>
)
}

function PostModal({
selectedPost,
setSelectedPost,
bids,
messages,
profile,
displayName,
getAvatar,
averageRating,
acceptBid,
isPostSaved,
toggleSaveRequest,
newMessage,
setNewMessage,
sendMessage,
setSelectedUser,
negotiatingBid,
setNegotiatingBid,
counterPrice,
setCounterPrice,
sendCounterOffer,
}) {
const acceptedBid = bids.find(b => b.id === selectedPost.accepted_bid_id)
const postBids = bids.filter(b => b.post_id === selectedPost.id)

const isOwner = profile?.email === selectedPost.user_email
const canChat =
profile?.email === selectedPost.user_email ||
profile?.email === acceptedBid?.user_email

const isOpen = selectedPost.status === 'open'

return (
<div className="profile-overlay" onClick={() => setSelectedPost(null)}>
<div className="profile-modal post-modal" onClick={(e) => e.stopPropagation()}>
<button
className="close-button"
onClick={() => setSelectedPost(null)}
>
✕
</button>

<div className="post-modal-header">
<div
className="avatar-circle clickable"
onClick={() => setSelectedUser(selectedPost.user_email)}
>
{getAvatar(selectedPost.user_email)}
</div>

<div>
<p
className="post-user clickable"
onClick={() => setSelectedUser(selectedPost.user_email)}
>
{displayName(selectedPost.user_email)}
</p>
<p className="post-user-rating">
{averageRating(selectedPost.user_email)}
</p>
</div>

<span className="status-pill modal-status">
{statusLabel(selectedPost.status)}
</span>
</div>

<h2>{selectedPost.title}</h2>
<p>{selectedPost.description}</p>

<div className="post-tags modal-info-grid">
<span className="info-pill">📍 {selectedPost.location || 'Not listed'}</span>
<span className="info-pill">💵 {selectedPost.budget || 'Not listed'}</span>
<span className={urgencyClass(selectedPost.urgency)}>
🔥 {selectedPost.urgency || 'No rush'}
</span>
</div>

<PhotoCarousel
images={
selectedPost.image_urls?.length
? selectedPost.image_urls
: [selectedPost.image_url]
}
/>

<div className="modal-action-row">
<button onClick={() => toggleSaveRequest(selectedPost.id)}>
{isPostSaved(selectedPost.id) ? 'Saved' : 'Save'}
</button>
</div>

{acceptedBid && (
<div className="deal-card">
<h3>Offer Accepted</h3>
<p><strong>{acceptedBid.price}</strong></p>

<div
className="accepted-user"
onClick={() => setSelectedUser(acceptedBid.user_email)}
>
<div className="avatar">
{getAvatar(acceptedBid.user_email)}
</div>

<div>
<p className="name">{displayName(acceptedBid.user_email)}</p>
<p className="rating">{averageRating(acceptedBid.user_email)}</p>
</div>
</div>

<p className="message">"{acceptedBid.message}"</p>
</div>
)}

<h3 className="offers-title">Offers ({postBids.length})</h3>

{postBids.length === 0 && <p>No offers yet.</p>}

{postBids.map(bid => {
const isAccepted = selectedPost.accepted_bid_id === bid.id

return (
<div
key={bid.id}
className={isAccepted ? 'bid-card accepted-bid-card' : 'bid-card'}
>
<div className="offer-header">
<div>
<strong>{bid.price}</strong>

<div className="offer-badges">
{bid.final_offer && (
<span className="offer-badge final-offer">Final Offer</span>
)}

{bid.status === 'counter_requested' && (
<span className="offer-badge">Counter Requested</span>
)}
</div>
</div>

<span>
{displayName(bid.user_email)} · {averageRating(bid.user_email)}
</span>
</div>

<p>{bid.message}</p>

{bid.image_url && (
<img src={bid.image_url} className="bid-image" alt="Bid" />
)}

{isOwner && isOpen && (
<div className="bid-actions">
<button
className="success-button"
onClick={() => acceptBid(selectedPost.id, bid.id)}
>
Accept Offer
</button>

{!bid.final_offer && (
<button
className="danger-button"
onClick={() => setNegotiatingBid(bid)}
>
Reject / Counter
</button>
)}
</div>
)}

{negotiatingBid && negotiatingBid.id === bid.id && !bid.final_offer && (
<div className="reject-box">
<p>Counter this offer</p>

<input
type="number"
placeholder="Enter your counter price"
value={counterPrice}
onChange={(e) => setCounterPrice(e.target.value)}
/>

<div style={{ marginTop: '8px' }}>
<button
className="success-button"
onClick={() => sendCounterOffer(bid)}
>
Send Counter
</button>

<button
className="danger-button"
onClick={() => setNegotiatingBid(null)}
style={{ marginLeft: '8px' }}
>
Cancel
</button>
</div>
</div>
)}
</div>
)
})}

{acceptedBid && canChat && (
<div className="chat-box">
<div className="deal-summary-bar">
<strong>Deal Details</strong>
<span>{selectedPost.title}</span>
<span>{acceptedBid.price}</span>
</div>

<h3>Chat</h3>

{messages
.filter(m => m.post_id === selectedPost.id)
.map(msg => (
<div
key={msg.id}
className={
msg.user_email === profile?.email
? 'chat-message own-message'
: 'chat-message'
}
>

<div className="chat-bubble">
<p>{msg.message}</p>

<span className="chat-meta">
{displayName(msg.user_email)}
</span>
</div>

</div>
))}

<input
value={newMessage}
onChange={e => setNewMessage(e.target.value)}
placeholder="Type message..."
/>

<button
onClick={() =>
sendMessage(selectedPost.id, acceptedBid, selectedPost.user_email)
}
>
Send
</button>
</div>
)}
</div>
</div>
)
}

function Feed(props) {
const {
posts,
bids,
messages,
profile,
displayName,
getAvatar,
averageRating,
activeBidPostId,
setActiveBidPostId,
activeChatPostId,
setActiveChatPostId,
bidPrice,
setBidPrice,
bidMessage,
setBidMessage,
setBidImage,
submitBid,
acceptBid,
updatePostStatus,
negotiatingBid,
setNegotiatingBid,
counterPrice,
setCounterPrice,
sendCounterOffer,
newMessage,
setNewMessage,
sendMessage,
setReviewModal,
reviews,
isPostSaved,
savedCount,
toggleSaveRequest,
requireLogin,
setSelectedUser,
setSelectedPost,
} = props

if (posts.length === 0) return <p>No posts yet.</p>

return (
<div className="feed">
{posts.map(post => {
const postBids = bids.filter(bid => bid.post_id === post.id)
const acceptedBid = bids.find(bid => bid.id === post.accepted_bid_id)
const postMessages = messages.filter(msg => msg.post_id === post.id)
const isOwner = profile?.email === post.user_email
const isAcceptedBidder = profile?.email === acceptedBid?.user_email
const canChat = isOwner || isAcceptedBidder
const isOpen =
post.status !== 'in_progress' &&
post.status !== 'completed' &&
post.status !== 'cancelled'

const saved = isPostSaved(post.id)
const totalSaved = savedCount(post.id)

const revieweeEmail = isOwner ? acceptedBid?.user_email : post.user_email

const hasReviewed = profile
? reviews.some(
r =>
r.post_id === post.id &&
r.reviewer_email === profile.email &&
r.reviewee_email === revieweeEmail
)
: false

const bidPrices = postBids
.map(bid => Number(String(bid.price || '').replace(/[^0-9.]/g, '')))
.filter(num => !Number.isNaN(num) && num > 0)

const bestPrice = bidPrices.length > 0 ? Math.min(...bidPrices) : null

return (
<div
className="post-card clickable"
key={post.id}
onClick={() => setSelectedPost(post)}
>
<div className="post-card-top">
<div className="post-header">
<div
className="avatar-circle clickable"
onClick={(e) => {
e.stopPropagation()
setSelectedUser(post.user_email)
}}
>
{getAvatar(post.user_email)}
</div>

<div>
<div
className="post-user clickable"
onClick={(e) => {
e.stopPropagation()
setSelectedUser(post.user_email)
}}
>
{displayName(post.user_email)}
</div>

<div className="post-user-rating">
{averageRating(post.user_email)}
</div>
</div>
</div>

<button
className={saved ? 'save-button saved-button' : 'save-button'}
onClick={(e) => {
e.stopPropagation()
toggleSaveRequest(post.id)
}}
>
{saved ? 'Saved' : 'Save'}
</button>
</div>

<div className="post-status-row">
<span className="status-pill">{statusLabel(post.status)}</span>
{totalSaved > 0 && <span className="save-count">🔖 {totalSaved}</span>}
<span className="save-count">💬 {postBids.length}</span>
</div>

<div className="post-title-row">
<h3 className="post-title">{post.title}</h3>

{bestPrice && (
<div className="best-offer-pill">
Best ${bestPrice}
</div>
)}
</div>

<p className="post-description">
{post.description?.slice(0, 140)}
{post.description?.length > 140 ? "..." : ""}
</p>

<div className="post-tags">
<span className="info-pill">📍 {post.location || 'Not listed'}</span>
<span className="info-pill">💵 {post.budget || 'Not listed'}</span>
<span className={urgencyClass(post.urgency)}>
🔥 {post.urgency || 'No rush'}
</span>
</div>

<PhotoCarousel
images={post.image_urls?.length ? post.image_urls : [post.image_url]}
/>

<div className="post-rating-footer">
{averageRating(post.user_email)}
</div>

{isOpen && (
<>
<button
className="secondary-button"
onClick={(e) => {
e.stopPropagation()

if (!profile) {
requireLogin()
return
}

setActiveBidPostId(post.id)
}}
>
I can help / Submit Bid
</button>

<button
className="secondary-button"
onClick={(e) => {
e.stopPropagation()

if (!profile) {
requireLogin()
return
}

setActiveBidPostId(activeBidPostId === post.id ? null : post.id)
}}
>
View Offers ({postBids.length})
</button>

{profile && activeBidPostId === post.id && (
<div className="bid-box" onClick={(e) => e.stopPropagation()}>
<input
value={bidPrice}
onChange={e => setBidPrice(e.target.value)}
placeholder="Your price"
/>

<textarea
value={bidMessage}
onChange={e => setBidMessage(e.target.value)}
placeholder="What do you have or how can you help?"
/>

<input
type="file"
accept="image/*"
onChange={e => setBidImage(e.target.files[0])}
/>

<button onClick={() => submitBid(post.id)}>
Submit Bid
</button>

<h4>Offers</h4>

{postBids.length === 0 && <p>No offers yet.</p>}

{postBids.map(bid => {
const numericBid = Number(String(bid.price || '').replace(/[^0-9.]/g, ''))
const isBestPrice = bestPrice !== null && numericBid === bestPrice

return (
<div className="bid-card" key={bid.id}>
<div className="offer-header">
<strong>{bid.price}</strong>
<span>{displayName(bid.user_email)} · {averageRating(bid.user_email)}</span>
</div>

<div className="offer-badges">
{isBestPrice && (
<span className="offer-badge best-price">
Best Price
</span>
)}

{bid.final_offer && (
<span className="offer-badge final-offer">
Final Offer
</span>
)}

{averageRating(bid.user_email).includes('5.0') && (
<span className="offer-badge trusted">
Trusted
</span>
)}

{bid.status === 'counter_requested' && (
<span className="offer-badge">
Counter Requested
</span>
)}
</div>

<p>{bid.message}</p>

{bid.image_url && (
<img
className="bid-image"
src={bid.image_url}
alt="Bid"
/>
)}

{isOwner && (
<div className="bid-actions">
<button
className="success-button"
onClick={() => acceptBid(post.id, bid.id)}
>
Accept Offer
</button>

{!bid.final_offer && (
<button
className="danger-button"
onClick={(e) => {
e.stopPropagation()
setNegotiatingBid(bid)
}}
>
Reject / Counter
</button>
)}
</div>
)}

{negotiatingBid && negotiatingBid.id === bid.id && !bid.final_offer && (
<div className="reject-box">
<p>Counter this offer</p>

<input
type="number"
placeholder="Enter your counter price"
value={counterPrice}
onChange={(e) => setCounterPrice(e.target.value)}
/>

<div style={{ marginTop: '8px' }}>
<button
className="success-button"
onClick={() => sendCounterOffer(bid)}
>
Send Counter
</button>

<button
className="danger-button"
onClick={() => setNegotiatingBid(null)}
style={{ marginLeft: '8px' }}
>
Cancel
</button>
</div>
</div>
)}
</div>
)
})}
</div>
)}
</>
)}

{!isOpen && (
<div className="deal-card" onClick={(e) => e.stopPropagation()}>
<h4>{statusLabel(post.status)}</h4>

<p>
<strong>Accepted Offer:</strong>{' '}
{profile ? acceptedBid?.price : 'Log in to view'}
</p>

{profile && <p>{acceptedBid?.message}</p>}

<p>
<strong>Status:</strong> {post.status}
</p>

{!profile && (
<button onClick={requireLogin}>
Log in to view deal details
</button>
)}

{profile && (
<div className="deal-actions">
{canChat && post.status !== 'cancelled' && (
<button onClick={() => setActiveChatPostId(post.id)}>
Open Chat
</button>
)}

{isOwner && post.status === 'in_progress' && (
<>
<button
className="success-button"
onClick={() => updatePostStatus(post.id, 'completed')}
>
Mark Complete
</button>

<button
className="secondary-button"
onClick={() => updatePostStatus(post.id, 'open')}
>
Reopen
</button>

<button
className="danger-button"
onClick={() => updatePostStatus(post.id, 'cancelled')}
>
Cancel
</button>
</>
)}

{canChat && post.status === 'completed' && !hasReviewed && revieweeEmail && (
<button
onClick={() =>
setReviewModal({
postId: post.id,
revieweeEmail,
})
}
>
Leave Review
</button>
)}

{hasReviewed && (
<p className="status-message">
Review submitted ✅
</p>
)}
</div>
)}

{profile && canChat && activeChatPostId === post.id && post.status !== 'cancelled' && (
<div className="chat-box">
{postMessages.map(msg => (
<div className="chat-message" key={msg.id}>
<strong>{displayName(msg.user_email)}</strong>: {msg.message}
</div>
))}

<input
value={newMessage}
onChange={e => setNewMessage(e.target.value)}
placeholder="Type message..."
/>

<button
onClick={() =>
sendMessage(post.id, acceptedBid, post.user_email)
}
>
Send
</button>
</div>
)}
</div>
)}
</div>
)
})}
</div>
)
}

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<App />
</React.StrictMode>
)