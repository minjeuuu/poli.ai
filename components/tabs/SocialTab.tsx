import { ImageWithFallback } from '../atoms/ImageWithFallback';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SocialPost, Comment } from '../../types';
import { 
    MessageSquare, Share2, BookOpen, ChevronDown, CheckCircle, AlertCircle, 
    HelpCircle, Globe, Filter, X, ArrowRight, Zap, GraduationCap, Scale, 
    LayoutGrid, List, Clock, Heart, Play, Film, Image as ImageIcon, Send, MoreHorizontal, User,
    Loader2, UploadCloud, BarChart2, Swords, Video as VideoIcon, Mic, Camera, FileText,
    TrendingUp, Award, Maximize2, Pause, Copy, Link as LinkIcon, Volume2, VolumeX, ArrowUp, Bookmark
} from 'lucide-react';
import { IconRenderer } from '../IconMap';
import { playSFX } from '../../services/soundService';
import ReaderView from '../ReaderView';
import { TrendRadar } from '../social/TrendRadar'; 
import { db } from '../../services/database';
import socket from '../../services/socket';

interface SocialTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
  user?: any;
}

const FEED_FILTERS = ["Global", "Theory", "History", "Americas", "Europe", "Asia", "Africa", "Video", "Reel", "Poll", "Debate"];

const SocialTab: React.FC<SocialTabProps> = ({ onNavigate, user }) => {
  const [activeFilter, setActiveFilter] = useState('Global');
  const [feed, setFeed] = useState<SocialPost[]>([]); 
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Interaction State
  const [activeCommentsId, setActiveCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [activeReader, setActiveReader] = useState<{title: string, author: string} | null>(null);
  
  // Reels State
  const [reelMode, setReelMode] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const reelContainerRef = useRef<HTMLDivElement>(null);

  // Toast
  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // INITIAL LOAD FROM API & SOCKET
  useEffect(() => {
    const initFeed = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            if (Array.isArray(data)) {
                setFeed(data);
            }
        } catch (e) {
            console.error("Feed Init Error", e);
        } finally {
            setLoading(false);
        }
    };
    initFeed();

    socket.on('new_post', (post: SocialPost) => {
        setFeed(prev => [post, ...prev]);
        playSFX('notification');
    });

    socket.on('update_post', (updatedPost: SocialPost) => {
        setFeed(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    });

    return () => {
        socket.off('new_post');
        socket.off('update_post');
    };
  }, []);

  const filteredFeed = useMemo(() => {
      let data = feed;
      if (activeFilter !== 'Global') {
          data = feed.filter(p => 
              p.discipline.includes(activeFilter) || 
              p.region?.includes(activeFilter) || 
              (activeFilter === 'History' && p.type === 'Historical') ||
              (activeFilter === 'Theory' && p.type === 'Theory') ||
              (activeFilter === 'Video' && p.type === 'Video') ||
              (activeFilter === 'Reel' && p.type === 'Reel') ||
              (activeFilter === 'Poll' && p.type === 'Poll') ||
              (activeFilter === 'Debate' && p.type === 'Debate')
          );
      }
      return data; 
  }, [feed, activeFilter]);

  const reelsFeed = useMemo(() => {
      return feed.filter(p => p.type === 'Reel' || p.type === 'Video');
  }, [feed]);

  const showToast = (msg: string) => {
      setToast({show: true, msg});
      setTimeout(() => setToast({show: false, msg: ''}), 2000);
  };

  const handlePostClick = (post: SocialPost) => {
      if (post.type === 'Reel') {
          playSFX('open');
          const idx = reelsFeed.findIndex(r => r.id === post.id);
          setActiveReelIndex(idx !== -1 ? idx : 0);
          setReelMode(true);
      } else {
          setExpandedPostId(expandedPostId === post.id ? null : post.id);
      }
  };

  const handleShare = async (e: React.MouseEvent, post: SocialPost) => {
      e.stopPropagation();
      playSFX('click');
      const text = `${post.title} - ${post.content}`;
      if (navigator.share) {
          try {
              await navigator.share({ title: post.title, text: text, url: window.location.href });
          } catch (err) { console.debug("Share failed"); }
      } else {
          navigator.clipboard.writeText(text);
          showToast("Copied to clipboard");
      }
  };

  const handleSavePost = (e: React.MouseEvent, post: SocialPost) => {
      e.stopPropagation();
      playSFX('success');
      showToast("Post Saved to Archive");
  };

  const handleTagClick = (e: React.MouseEvent, type: string, name: string) => {
      e.stopPropagation();
      playSFX('click');
      onNavigate(type, name);
  };

  const handleCitationClick = (e: React.MouseEvent, title: string, author: string) => {
      e.stopPropagation();
      playSFX('open');
      setActiveReader({ title, author });
  };

  const handleCreatePost = async () => {
      if (!newPostContent.trim()) return;
      playSFX('click');
      setIsUploading(true);
      
      const newPost: SocialPost = {
          id: `new-${Date.now()}`,
          type: 'Analysis',
          title: "Latest Field Report",
          author: { 
              name: user?.displayName || 'Scholar',
              credential: 'Researcher',
              handle: user?.username ? `@${user.username}` : '@scholar',
              avatar: 'ME',
              verified: true
          },
          timestamp: "Just now",
          content: newPostContent,
          fullContent: newPostContent,
          discipline: "General",
          citations: [],
          reactions: { valid: 0, disputed: 0, citationNeeded: 0, hearts: 0 },
          comments: [],
          tags: []
      };

      try {
          await fetch('/api/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPost)
          });
          
          setNewPostContent('');
          setIsCreating(false);
          playSFX('success');
          showToast("Analysis Published");
      } catch (e) {
          console.error("Post creation failed", e);
          showToast("Failed to publish");
      } finally {
          setIsUploading(false);
      }
  };

  const handleReaction = async (e: React.MouseEvent, id: string, type: 'hearts' | 'valid') => {
      e.stopPropagation();
      playSFX('click');
      
      try {
          // Optimistic update
          setFeed(prev => prev.map(p => {
              if (p.id === id) {
                  return { 
                      ...p, 
                      reactions: { ...p.reactions, [type]: p.reactions[type] + 1 } 
                  };
              }
              return p;
          }));

          await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      } catch (e) {
          console.error("Reaction failed", e);
      }
  };

  const handleAddComment = async (postId: string) => {
      if (!commentInput.trim()) return;
      playSFX('type');
      
      const newComment: Comment = {
          id: `c-${Date.now()}`,
          user: user?.displayName || 'Scholar',
          text: commentInput,
          timestamp: 'Just now',
          likes: 0
      };
      
      try {
          // Optimistic update
          setFeed(prev => prev.map(p => {
              if (p.id === postId) {
                  return { ...p, comments: [...p.comments, newComment] };
              }
              return p;
          }));

          await fetch(`/api/posts/${postId}/comment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newComment)
          });
          
          setCommentInput('');
      } catch (e) {
          console.error("Comment failed", e);
      }
  };

  const renderSpotlight = () => null;

  const renderCreatePost = () => (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 mb-8 shadow-sm relative overflow-hidden">
          {isUploading && (
              <div className="absolute inset-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in">
                  <div className="w-12 h-12 bg-academic-accent text-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <ArrowRight className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-300">Broadcasting to Network...</span>
              </div>
          )}
          
          <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-academic-accent dark:bg-indigo-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
              </div>
              <div className="flex-1 relative">
                <textarea 
                    placeholder="Share an academic insight or observation..."
                    className="w-full bg-transparent outline-none resize-none text-sm font-serif text-stone-700 dark:text-stone-200 placeholder-stone-400 py-2 h-20"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onFocus={() => setIsCreating(true)}
                />
              </div>
          </div>
          {isCreating && (
              <div className="flex justify-between items-center pt-3 border-t border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-1">
                  <div className="flex gap-2 text-stone-400">
                      <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider group">
                          <ImageIcon className="w-4 h-4 group-hover:text-academic-accent" />
                      </button>
                      <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider group">
                          <BarChart2 className="w-4 h-4 group-hover:text-academic-accent" />
                      </button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setIsCreating(false)} className="px-4 py-1.5 text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-600 transition-colors">Cancel</button>
                      <button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="px-6 py-1.5 bg-academic-accent dark:bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-stone-700 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      >
                          Post <Send className="w-3 h-3" />
                      </button>
                  </div>
              </div>
          )}
      </div>
  );

  const renderVideoPlayer = (post: SocialPost, autoplay = false) => {
      if (!post.videoUrl) return null;
      return (
        <div className="mt-4 aspect-video bg-black relative flex items-center justify-center group overflow-hidden rounded-lg shadow-md" onClick={(e) => { e.stopPropagation(); setPlayingVideoId(post.id); }}>
             {playingVideoId === post.id || autoplay ? (
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${post.videoUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`} 
                    title={post.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 z-20"
                ></iframe>
             ) : (
                <>
                    <ImageWithFallback 
                        src={`https://img.youtube.com/vi/${post.videoUrl}/hqdefault.jpg`} 
                        alt="Video Thumbnail" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg z-10 border-2 border-white/50">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </>
             )}
        </div>
      );
  };

  const handleScrollReel = (direction: 'up' | 'down') => {
      if (direction === 'up' && activeReelIndex > 0) {
          setActiveReelIndex(prev => prev - 1);
      } else if (direction === 'down' && activeReelIndex < reelsFeed.length - 1) {
          setActiveReelIndex(prev => prev + 1);
      }
      const el = document.getElementById(`reel-${direction === 'up' ? activeReelIndex - 1 : activeReelIndex + 1}`);
      el?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderReelViewer = () => (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <button onClick={() => setReelMode(false)} className="absolute top-4 right-4 z-50 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
             <X className="w-6 h-6" />
        </button>
        <div 
            ref={reelContainerRef}
            className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
            {reelsFeed.map((reel, index) => (
                <div key={reel.id} id={`reel-${index}`} className="w-full h-full snap-start relative flex items-center justify-center bg-stone-900">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${reel.videoUrl}?autoplay=${index === activeReelIndex ? 1 : 0}&mute=0&controls=0&loop=1&playlist=${reel.videoUrl}&playsinline=1&enablejsapi=1&origin=${origin}`} 
                        title={reel.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full object-cover pointer-events-auto md:max-w-[56.25vh] max-w-full"
                    ></iframe>
                     <div className="absolute bottom-0 left-0 w-full p-6 pb-12 md:pb-6 z-20 flex items-end justify-between pointer-events-none">
                          <div className="flex-1 max-w-2xl pr-12 pointer-events-auto">
                              <h2 className="text-xl md:text-3xl font-serif font-bold text-white mb-2 leading-tight text-shadow-md">{reel.title}</h2>
                              <p className="text-white/90 text-sm md:text-base font-serif line-clamp-3 mb-4">{reel.content}</p>
                          </div>
                     </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <>
    <div 
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[80] flex items-center gap-3 px-6 py-3 bg-academic-accent dark:bg-indigo-600 text-white rounded-full shadow-xl transition-all duration-500 ease-out pointer-events-none
        ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
        <CheckCircle className="w-3 h-3 text-white" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.msg}</span>
    </div>

    {reelMode && renderReelViewer()}

    <div className="h-full flex flex-col bg-stone-50/50 dark:bg-black/20 relative">
        <div className="sticky top-0 z-30 bg-academic-bg/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-academic-line dark:border-stone-800 transition-colors">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-academic-accent text-white rounded-lg shadow-sm"><MessageSquare className="w-5 h-5" /></div>
                    <h1 className="text-xl font-serif font-bold text-academic-text dark:text-stone-100">Global Discourse</h1>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800">
                    <button onClick={() => setTimelineMode(false)} className={`p-2 rounded-md transition-colors ${!timelineMode ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-indigo-400' : 'text-stone-400'}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setTimelineMode(true)} className={`p-2 rounded-md transition-colors ${timelineMode ? 'bg-white dark:bg-stone-800 shadow-sm text-academic-accent dark:text-indigo-400' : 'text-stone-400'}`}><Clock className="w-4 h-4" /></button>
                </div>
            </div>
            
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                {FEED_FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all whitespace-nowrap active:scale-95
                        ${activeFilter === filter 
                            ? 'bg-academic-text dark:bg-stone-100 text-white dark:text-stone-900 border-academic-text dark:border-stone-100 shadow-sm' 
                            : 'bg-transparent text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-academic-accent hover:text-academic-accent'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 scroll-smooth">
            {loading ? (
                 <div className="flex justify-center py-20">
                     <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                 </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {renderSpotlight()}
                    {renderCreatePost()}

                    <div className="space-y-6">
                        {filteredFeed.map((post) => (
                            <div 
                                key={post.id} 
                                onClick={() => handlePostClick(post)}
                                className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer relative
                                ${expandedPostId === post.id ? 'shadow-2xl ring-1 ring-academic-accent dark:ring-indigo-500 scale-[1.01] z-20' : 'shadow-sm hover:shadow-md hover:border-academic-accent/30'}`}
                            >
                                <div className="p-6 pb-2 flex justify-between items-start">
                                    <button onClick={(e) => { e.stopPropagation(); onNavigate('Person', post.author.name); }} className="flex items-center gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 font-serif font-bold border border-stone-200 dark:border-stone-700 group-hover:border-academic-accent dark:group-hover:border-indigo-500 transition-colors">
                                            {post.author.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-stone-800 dark:text-stone-200 group-hover:underline decoration-academic-accent underline-offset-2">{post.author.name}</div>
                                            <div className="text-[10px] text-stone-400 uppercase tracking-wider">{post.author.credential} • {post.timestamp}</div>
                                        </div>
                                    </button>
                                    <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border bg-stone-50 dark:bg-stone-800 text-stone-500 border-stone-100 dark:border-stone-700">
                                        {post.type}
                                    </span>
                                </div>

                                <div className="px-6 py-2">
                                    <h2 className="text-lg md:text-xl font-serif font-bold text-academic-text dark:text-stone-100 mb-3 leading-tight">{post.title}</h2>
                                    <p className={`font-serif text-stone-600 dark:text-stone-300 leading-relaxed text-sm transition-all ${expandedPostId === post.id ? '' : 'line-clamp-3'}`}>
                                        {expandedPostId === post.id ? post.fullContent : post.content}
                                    </p>
                                </div>

                                {post.type === 'Video' && renderVideoPlayer(post)}

                                <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                                    <div className="flex gap-4">
                                        <button onClick={(e) => handleReaction(e, post.id, 'hearts')} className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition-colors group active:scale-90">
                                            <Heart className={`w-4 h-4 ${post.reactions.hearts > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span>{post.reactions.hearts}</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setActiveCommentsId(activeCommentsId === post.id ? null : post.id); }} className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-blue-500 transition-colors active:scale-90">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{post.comments.length}</span>
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={(e) => handleSavePost(e, post)} className="text-stone-400 hover:text-academic-gold transition-colors active:scale-90"><Bookmark className="w-4 h-4" /></button>
                                        <button onClick={(e) => handleShare(e, post)} className="text-stone-400 hover:text-academic-accent transition-colors active:scale-90"><Share2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                
                                {activeCommentsId === post.id && (
                                    <div className="bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 p-4 animate-in slide-in-from-top-2">
                                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                                            {post.comments.map(comment => (
                                                <div key={comment.id} className="flex gap-3">
                                                    <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 text-xs font-bold">
                                                        {comment.user.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{comment.user}</span>
                                                            <span className="text-[10px] text-stone-400">{comment.timestamp}</span>
                                                        </div>
                                                        <p className="text-sm text-stone-600 dark:text-stone-400 font-serif">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Add an academic comment..."
                                                className="flex-1 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm focus:outline-none focus:border-academic-accent dark:focus:border-indigo-500 transition-colors"
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                            />
                                            <button onClick={(e) => { e.stopPropagation(); handleAddComment(post.id); }} className="p-2 bg-academic-accent dark:bg-indigo-600 text-white rounded-full hover:scale-105 transition-transform"><Send className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="text-center py-12">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">End of Feed</p>
                    </div>
                </div>
            )}
        </div>
    </div>

    {activeReader && (
        <ReaderView title={activeReader.title} author={activeReader.author} onClose={() => setActiveReader(null)} />
    )}
    </>
  );
};

export default SocialTab;
