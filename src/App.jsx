import React, { useState, useEffect, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { User, Calendar, MapPin, CreditCard, Ticket, LogOut, ChevronLeft, Search, Star, Clock, Trash2, List, CheckCircle, ChevronRight } from 'lucide-react';

// --- 1. KEYCLOAK CONFIGURATION ---
const client = new Keycloak({
  url: "http://localhost:8080",
  realm: "MovieRealm",
  clientId: "movie-app",
});

// --- 2. MOVIE DATA ---
const MOVIES = [
  { id: 1, title: "Inception", genre: "Sci-Fi", duration: "2h 15m", rating: 4.8, image: "/inception.jpeg", desc: "A thief who steals corporate secrets." },
  { id: 2, title: "The Dark Knight Rises", genre: "Action", duration: "2h 45m", rating: 4.9, image: "/The_Dark_Knight.jpg", desc: "Batman returns." },
  { id: 3, title: "Interstellar", genre: "Sci-Fi", duration: "2h 49m", rating: 4.7, image: "/intersteller.jpeg", desc: "Space travel." },
  { id: 4, title: "Cyberpunk: Edgerunners", genre: "Anime", duration: "1h 55m", rating: 4.6, image: "/cyberpunkEdgerunners.jpeg", desc: "Dystopian future." }
];

const SHOWTIMES = ["10:30 AM", "1:15 PM", "4:45 PM", "8:00 PM"];

// --- 3. COMPONENTS ---

const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 text-center">
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
           <Ticket className="text-slate-900 w-8 h-8" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2 font-mono">GOLDEN SEAT</h1>
      <p className="text-slate-400 mb-8">Enterprise Booking System</p>
      
      <button onClick={onLogin} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group">
        <User className="w-5 h-5 group-hover:scale-110 transition-transform" /> Login with SSO (Keycloak)
      </button>
    </div>
  </div>
);

const MovieCard = ({ movie, onSelect }) => (
  <div onClick={() => onSelect(movie)} className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer hover:shadow-cyan-900/20 hover:shadow-lg relative">
    <div className="h-64 overflow-hidden">
      <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold text-white">{movie.rating}</span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-bold text-white mb-1 truncate">{movie.title}</h3>
      <p className="text-slate-400 text-sm mb-3">{movie.genre}</p>
      <div className="flex items-center text-xs text-slate-500 gap-4">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.duration}</span>
      </div>
    </div>
  </div>
);

const MovieDetails = ({ movie, onBack, onTimeSelect }) => (
  <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
      <ChevronLeft className="w-4 h-4" /> Back to Movies
    </button>
    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 h-64 md:h-auto relative">
        <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r" />
      </div>
      <div className="p-8 md:w-2/3 flex flex-col justify-center">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-500 mb-2 font-bold text-sm uppercase tracking-wider">{movie.genre}</div>
          <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
          <div className="flex items-center gap-6 text-slate-400 text-sm mb-6">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.duration}</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {movie.rating} Rating</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">{movie.desc}</p>
        </div>
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-500" /> Select Showtime</h3>
          <div className="flex flex-wrap gap-3">
            {SHOWTIMES.map((time) => (
              <button key={time} onClick={() => onTimeSelect(time)} className="px-6 py-2 bg-slate-700 hover:bg-cyan-600 text-white rounded-lg transition-colors border border-slate-600 hover:border-cyan-500">
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SeatMap = ({ onConfirm, onBack, movie, time, bookedSeats }) => {
  const rows = 8;
  const cols = 8;
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (row, col) => {
    const seatId = `${row}-${col}`;
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) setSelectedSeats(prev => prev.filter(id => id !== seatId));
    else setSelectedSeats(prev => [...prev, seatId]);
  };

  const getSeatColor = (row, col) => {
    const seatId = `${row}-${col}`;
    if (bookedSeats.includes(seatId)) return 'bg-slate-700 cursor-not-allowed opacity-50';
    if (selectedSeats.includes(seatId)) return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-110';
    return 'bg-slate-600 hover:bg-slate-500 cursor-pointer';
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back to Details</button>
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-center mb-8"><h2 className="text-2xl font-bold text-white">{movie.title}</h2><p className="text-cyan-500 mt-1">{time} • Hall 4</p></div>
        <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-12 rounded-full opacity-50 shadow-[0_10px_20px_rgba(6,182,212,0.2)]"></div>
        <div className="flex flex-col gap-3 items-center mb-10">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-3">
              {Array.from({ length: cols }).map((_, c) => (
                <div key={`${r}-${c}`} onClick={() => toggleSeat(r, c)} className={`w-8 h-8 rounded-t-lg transition-all duration-200 ${getSeatColor(r, c)}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 pt-6 flex justify-between items-center">
          <div><p className="text-slate-400 text-sm">Total Price</p><p className="text-2xl font-bold text-white">${selectedSeats.length * 12}.00</p></div>
          <button disabled={selectedSeats.length === 0} onClick={() => onConfirm(selectedSeats)} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all">Proceed to Payment</button>
        </div>
      </div>
    </div>
  );
};

const Checkout = ({ movie, seats, time, onComplete, onBack }) => {
  const [processing, setProcessing] = useState(false);
  const handlePay = () => {
    setProcessing(true);
    onComplete(seats);
  };

  return (
    <div className="max-w-md mx-auto animate-in zoom-in duration-300">
      <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Change Seats</button>
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="text-cyan-500" /> Payment</h2>
        <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700/50">
          <h3 className="font-bold text-white text-lg">{movie.title}</h3>
          <p className="text-slate-400 text-sm">{time} • {seats.length} Seats</p>
          <div className="my-3 h-px bg-slate-700"></div>
          <div className="flex justify-between text-white font-medium"><span>Total</span><span>${seats.length * 12}.00</span></div>
        </div>
        <button onClick={handlePay} disabled={processing} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
          {processing ? <span className="animate-spin">⌛</span> : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
};

// --- TICKET VIEW (NO VALID BLOCK, BLACK ORDER ID) ---
const TicketView = ({ movie, seats, time, orderId, onReset }) => {
  const safeSeats = Array.isArray(seats) ? seats : [];
  const movieTitle = movie ? movie.title : "Unknown Movie";

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-6 h-6 text-white" /></div>
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <p className="text-slate-400 text-xs mt-2">Confirmation email sent</p>
        </div>
        <div className="p-8">
          <div className="mb-6"><h3 className="text-2xl font-bold uppercase">{movieTitle}</h3><p className="text-slate-500">{time} | Hall 4</p></div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div><p className="text-xs text-slate-400 uppercase">Seats</p><p className="font-mono text-xl font-bold">{safeSeats.map(s => s.replace('-', '')).join(', ')}</p></div>
            <div><p className="text-xs text-slate-400 uppercase">Order ID</p><p className="font-mono text-xl font-bold text-black">#{orderId || "0000"}</p></div>
          </div>
        </div>
        <button onClick={onReset} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 font-bold uppercase">Back to Movies</button>
      </div>
    </div>
  );
};

const MyBookings = ({ bookings, onCancel, onView, onBack }) => (
  <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
    <button onClick={onBack} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2">
      <ChevronLeft className="w-4 h-4" /> Back to Movies
    </button>
    <h2 className="text-2xl font-bold text-white mb-6">My Bookings</h2>
    
    {bookings.length === 0 ? (
      <div className="text-center py-20 bg-slate-800 rounded-2xl border border-slate-700 text-slate-400">
        <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No active bookings found.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} 
               onClick={() => onView(booking)} 
               className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg cursor-pointer hover:border-cyan-500 transition-colors group">
            <div className="flex items-center gap-6">
               <div className="w-16 h-24 rounded-lg overflow-hidden hidden md:block">
                  <img src={booking.movie.image} className="w-full h-full object-cover" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{booking.movie.title}</h3>
                  <p className="text-cyan-500">{booking.time} • Order #{booking.orderId}</p>
                  <p className="text-slate-400 text-sm mt-1">Seats: {booking.seats.map(s => s.replace('-', '')).join(', ')}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); onCancel(booking.id, booking.seats); }}
                  className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Cancel
                </button>
                <ChevronRight className="text-slate-500 group-hover:text-white" />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// --- 4. MAIN APP LOGIC ---
const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('MOVIES'); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  // NEW: Search Term State
  const [searchTerm, setSearchTerm] = useState("");

  const [globalBookedSeats, setGlobalBookedSeats] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const isRun = useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;
    client.init({ onLoad: 'check-sso' }).then(authenticated => {
      if (authenticated) {
        const userName = client.tokenParsed.preferred_username || "User";
        const userEmail = client.tokenParsed.email || "no-email";
        setUser({ name: userName, email: userEmail, role: 'user' });
        
        fetch(`http://localhost:3000/api/my-bookings?user=${encodeURIComponent(userName)}`)
          .then(res => res.json())
          .then(data => {
            const groupedBookings = {};
            data.forEach(row => {
                const key = `${row.movie_title}-${row.show_time}-${row.order_id}`;
                if (!groupedBookings[key]) {
                    const movieObj = MOVIES.find(m => m.title === row.movie_title) || MOVIES[0];
                    groupedBookings[key] = {
                        id: key, 
                        movie: movieObj, 
                        time: row.show_time, 
                        seats: [],
                        orderId: row.order_id || "0000"
                    };
                }
                groupedBookings[key].seats.push(row.seat_number);
            });
            setMyBookings(Object.values(groupedBookings));
          })
          .catch(err => console.error("Error fetching history:", err));
      }
    }).catch(console.error);
  }, []);

  const handleLogin = () => client.login();
  const handleLogout = () => { client.logout(); setUser(null); setView('MOVIES'); };
  const handleSelectMovie = (movie) => { setSelectedMovie(movie); setView('DETAILS'); };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const url = `http://localhost:3000/api/bookings?movie=${encodeURIComponent(selectedMovie.title)}&time=${encodeURIComponent(time)}`;
    fetch(url).then(res => res.json()).then(data => { setGlobalBookedSeats(data); setView('SEATS'); });
  };
  
  const handlePaymentSuccess = (newSeats) => {
    const newOrderId = Math.floor(10000 + Math.random() * 90000);
    setCurrentOrderId(newOrderId);

    fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: user.name,
        email: user.email,
        movie: selectedMovie.title,
        time: selectedTime,
        seats: newSeats,
        orderId: newOrderId
      })
    })
    .then(res => res.json())
    .then(() => {
        setGlobalBookedSeats([...globalBookedSeats, ...newSeats]);
        const newBooking = { 
            id: Date.now(), 
            movie: selectedMovie, 
            time: selectedTime, 
            seats: newSeats,
            orderId: newOrderId 
        };
        setMyBookings([...myBookings, newBooking]);
        setView('TICKET');
    })
    .catch(err => alert("Booking Failed"));
  };

  const handleCancelBooking = (bookingId, seatsToFree) => {
    fetch('http://localhost:3000/api/bookings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats: seatsToFree })
    })
    .then(() => {
      setMyBookings(myBookings.filter(b => b.id !== bookingId));
      setGlobalBookedSeats(globalBookedSeats.filter(seat => !seatsToFree.includes(seat)));
    })
    .catch(err => alert("Cancellation Failed"));
  };

  const handleViewBooking = (booking) => {
      setSelectedMovie(booking.movie);
      setSelectedTime(booking.time);
      setSelectedSeats(booking.seats);
      setCurrentOrderId(booking.orderId);
      setView('TICKET');
  };

  const handleSeatConfirm = (seats) => { setSelectedSeats(seats); setView('CHECKOUT'); };
  const resetFlow = () => { setView('MOVIES'); setSelectedMovie(null); setSelectedSeats([]); };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetFlow}>
            <div className="bg-cyan-500 p-1.5 rounded-lg"><Ticket className="w-5 h-5 text-slate-900" /></div>
            <span className="font-bold text-white text-lg tracking-tight">GOLDEN SEAT</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm text-slate-400">Welcome, {user.name}</span>
            <button onClick={() => setView('MY_BOOKINGS')} className="text-slate-400 hover:text-white flex items-center gap-1 hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
              <List className="w-5 h-5" /> <span className="hidden sm:inline">My Bookings</span>
            </button>
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'MOVIES' && (
          <div className="animate-in fade-in duration-500">
            {/* UPDATED SEARCH BAR */}
            <div className="mb-8 relative">
                <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // <--- Binding state
                />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6">Now Showing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* FILTERING MOVIES */}
              {MOVIES.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).map(movie => (
                <MovieCard key={movie.id} movie={movie} onSelect={handleSelectMovie} />
              ))}
            </div>
          </div>
        )}
        
        {view === 'MY_BOOKINGS' && <MyBookings bookings={myBookings} onCancel={handleCancelBooking} onView={handleViewBooking} onBack={resetFlow} />}
        {view === 'DETAILS' && <MovieDetails movie={selectedMovie} onBack={() => setView('MOVIES')} onTimeSelect={handleTimeSelect} />}
        {view === 'SEATS' && <SeatMap movie={selectedMovie} time={selectedTime} bookedSeats={globalBookedSeats} onConfirm={handleSeatConfirm} onBack={() => setView('DETAILS')} />}
        {view === 'CHECKOUT' && <Checkout movie={selectedMovie} seats={selectedSeats} time={selectedTime} onComplete={handlePaymentSuccess} onBack={() => setView('SEATS')} />}
        {view === 'TICKET' && <TicketView movie={selectedMovie} seats={selectedSeats} time={selectedTime} orderId={currentOrderId} onReset={resetFlow} />}
      </main>
    </div>
  );
};

export default App;