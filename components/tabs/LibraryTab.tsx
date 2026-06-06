import { ImageWithFallback } from '../atoms/ImageWithFallback';

import React, { useState, useMemo } from 'react';
import { 
    Book, FileText, Scroll, Search, Music, Mic, BookOpen, Archive, 
    FileCheck, Star, Clock, Headphones, ArrowRight, Play, Globe, 
    Brain, ChevronRight, Bookmark, Download, Filter, Library,
    Gavel, Landmark, Feather, Quote, History, Zap, ArrowUpRight, MoreHorizontal, Image as ImageIcon
} from 'lucide-react';
import { playSFX } from '../../services/soundService';

interface LibraryTabProps {
  onNavigate: (type: string, payload: any) => void;
  onAddToCompare: (name: string, type: string) => void;
  onToggleSave: (item: any) => void;
  isSaved: (title: string, type: string) => boolean;
}

// --- MASSIVE LIBRARY ARCHIVE DATA ---
const LIBRARY_HIERARCHY: Record<string, { category: string; icon: any; desc: string; items: any[] }[]> = {
    "Books": [
        {
            category: "Ancient & Classical",
            icon: Landmark,
            desc: "Foundations of Western and Eastern political thought.",
            items: [
                { title: "The Republic", author: "Plato", year: "375 BCE", type: "Book" },
                { title: "Politics", author: "Aristotle", year: "335 BCE", type: "Book" },
                { title: "Nicomachean Ethics", author: "Aristotle", year: "340 BCE", type: "Book" },
                { title: "Analects", author: "Confucius", year: "475 BCE", type: "Book" },
                { title: "The Art of War", author: "Sun Tzu", year: "5th C. BCE", type: "Book" },
                { title: "Arthashastra", author: "Kautilya", year: "2nd C. BCE", type: "Book" },
                { title: "Meditations", author: "Marcus Aurelius", year: "180 CE", type: "Book" },
                { title: "On Duties", author: "Cicero", year: "44 BCE", type: "Book" },
                { title: "History of the Peloponnesian War", author: "Thucydides", year: "411 BCE", type: "Book" },
                { title: "Tao Te Ching", author: "Laozi", year: "4th C. BCE", type: "Book" },
                { title: "The Laws", author: "Plato", year: "350 BCE", type: "Book" },
                { title: "Cyropaedia", author: "Xenophon", year: "370 BCE", type: "Book" },
                { title: "Han Feizi", author: "Han Fei", year: "3rd C. BCE", type: "Book" },
                { title: "Mencius", author: "Mencius", year: "3rd C. BCE", type: "Book" }
            ]
        },
        {
            category: "Renaissance & Enlightenment",
            icon: Feather,
            desc: "The birth of modern statecraft and individual rights.",
            items: [
                { title: "The Prince", author: "Niccolò Machiavelli", year: "1532", type: "Book" },
                { title: "Discourses on Livy", author: "Niccolò Machiavelli", year: "1531", type: "Book" },
                { title: "Leviathan", author: "Thomas Hobbes", year: "1651", type: "Book" },
                { title: "Two Treatises of Government", author: "John Locke", year: "1689", type: "Book" },
                { title: "The Social Contract", author: "Jean-Jacques Rousseau", year: "1762", type: "Book" },
                { title: "The Spirit of the Laws", author: "Montesquieu", year: "1748", type: "Book" },
                { title: "Common Sense", author: "Thomas Paine", year: "1776", type: "Book" },
                { title: "The Wealth of Nations", author: "Adam Smith", year: "1776", type: "Book" },
                { title: "Reflections on the Revolution in France", author: "Edmund Burke", year: "1790", type: "Book" },
                { title: "A Vindication of the Rights of Woman", author: "Mary Wollstonecraft", year: "1792", type: "Book" },
                { title: "Perpetual Peace", author: "Immanuel Kant", year: "1795", type: "Book" },
                { title: "The Federalist Papers", author: "Hamilton, Madison, Jay", year: "1788", type: "Book" },
                { title: "Utopia", author: "Thomas More", year: "1516", type: "Book" },
                { title: "Democracy in America", author: "Alexis de Tocqueville", year: "1835", type: "Book" }
            ]
        },
        {
            category: "Modern & Critical Theory",
            icon: Brain,
            desc: "Industrialization, ideology, and critical analysis.",
            items: [
                { title: "The Communist Manifesto", author: "Marx & Engels", year: "1848", type: "Book" },
                { title: "Das Kapital", author: "Karl Marx", year: "1867", type: "Book" },
                { title: "On Liberty", author: "John Stuart Mill", year: "1859", type: "Book" },
                { title: "The Origins of Totalitarianism", author: "Hannah Arendt", year: "1951", type: "Book" },
                { title: "A Theory of Justice", author: "John Rawls", year: "1971", type: "Book" },
                { title: "Discipline and Punish", author: "Michel Foucault", year: "1975", type: "Book" },
                { title: "The Wretched of the Earth", author: "Frantz Fanon", year: "1961", type: "Book" },
                { title: "Orientalism", author: "Edward Said", year: "1978", type: "Book" },
                { title: "Capitalism and Freedom", author: "Milton Friedman", year: "1962", type: "Book" },
                { title: "The Road to Serfdom", author: "Friedrich Hayek", year: "1944", type: "Book" },
                { title: "Manufacturing Consent", author: "Noam Chomsky", year: "1988", type: "Book" },
                { title: "Gender Trouble", author: "Judith Butler", year: "1990", type: "Book" },
                { title: "The End of History?", author: "Francis Fukuyama", year: "1992", type: "Book" },
                { title: "The Clash of Civilizations", author: "Samuel Huntington", year: "1996", type: "Book" }
            ]
        }
    ],
    "Documents": [
        {
            category: "Constitutions",
            icon: Scroll,
            desc: "Supreme laws of sovereign nations.",
            items: [
                { title: "Constitution of the United States", author: "Convention", year: "1787", type: "Document" },
                { title: "Basic Law for the Federal Republic of Germany", author: "Council", year: "1949", type: "Document" },
                { title: "Constitution of India", author: "Assembly", year: "1950", type: "Document" },
                { title: "Constitution of Japan", author: "Diet", year: "1947", type: "Document" },
                { title: "Constitution of South Africa", author: "Parliament", year: "1996", type: "Document" },
                { title: "Constitution of France", author: "Republic", year: "1958", type: "Document" },
                { title: "Magna Carta", author: "King John", year: "1215", type: "Document" },
                { title: "Constitution of Mexico", author: "Congress", year: "1917", type: "Document" },
                { title: "Constitution of Brazil", author: "Assembly", year: "1988", type: "Document" },
                { title: "Constitution of China", author: "NPC", year: "1982", type: "Document" }
            ]
        },
        {
            category: "Treaties & Accords",
            icon: FileCheck,
            desc: "Agreements shaping the international order.",
            items: [
                { title: "Charter of the United Nations", author: "UN", year: "1945", type: "Document" },
                { title: "Universal Declaration of Human Rights", author: "UNGA", year: "1948", type: "Document" },
                { title: "Treaty of Versailles", author: "Allies", year: "1919", type: "Document" },
                { title: "Treaty of Westphalia", author: "HRE", year: "1648", type: "Document" },
                { title: "North Atlantic Treaty", author: "NATO", year: "1949", type: "Document" },
                { title: "Geneva Conventions", author: "ICRC", year: "1949", type: "Document" },
                { title: "Paris Agreement", author: "UNFCCC", year: "2015", type: "Document" },
                { title: "Maastricht Treaty", author: "EU", year: "1992", type: "Document" },
                { title: "Treaty of Lisbon", author: "EU", year: "2007", type: "Document" },
                { title: "Good Friday Agreement", author: "UK/Ireland", year: "1998", type: "Document" }
            ]
        },
        {
            category: "Speeches & Manifestos",
            icon: Mic,
            desc: "Words that changed history.",
            items: [
                { title: "I Have a Dream", author: "Martin Luther King Jr.", year: "1963", type: "Document" },
                { title: "Gettysburg Address", author: "Abraham Lincoln", year: "1863", type: "Document" },
                { title: "Farewell Address", author: "George Washington", year: "1796", type: "Document" },
                { title: "Iron Curtain Speech", author: "Winston Churchill", year: "1946", type: "Document" },
                { title: "Tryst with Destiny", author: "Jawaharlal Nehru", year: "1947", type: "Document" },
                { title: "The Ballot or the Bullet", author: "Malcolm X", year: "1964", type: "Document" },
                { title: "Pericles' Funeral Oration", author: "Thucydides", year: "431 BCE", type: "Document" }
            ]
        }
    ],
    "Journals": [
        {
            category: "Academic Journals",
            icon: FileText,
            desc: "Peer-reviewed political science research.",
            items: [
                { title: "Foreign Affairs", author: "CFR", year: "Current", type: "Journal" },
                { title: "American Political Science Review", author: "APSA", year: "Current", type: "Journal" },
                { title: "International Organization", author: "IO", year: "Current", type: "Journal" },
                { title: "World Politics", author: "Cambridge", year: "Current", type: "Journal" },
                { title: "Journal of Democracy", author: "NED", year: "Current", type: "Journal" },
                { title: "International Security", author: "Belfer", year: "Current", type: "Journal" },
                { title: "Political Theory", author: "Sage", year: "Current", type: "Journal" },
                { title: "Comparative Politics", author: "CUNY", year: "Current", type: "Journal" },
                { title: "European Journal of International Relations", author: "EISA", year: "Current", type: "Journal" },
                { title: "Journal of Peace Research", author: "PRIO", year: "Current", type: "Journal" }
            ]
        }
    ],
    "Anthems": [
        {
            category: "National Anthems",
            icon: Music,
            desc: "Symbols of state identity and sovereignty.",
            items: [
                { title: "The Star-Spangled Banner", author: "USA", year: "1931", type: "Song" },
                { title: "La Marseillaise", author: "France", year: "1795", type: "Song" },
                { title: "God Save the King", author: "United Kingdom", year: "1745", type: "Song" },
                { title: "Kimigayo", author: "Japan", year: "1880", type: "Song" },
                { title: "March of the Volunteers", author: "China", year: "1949", type: "Song" },
                { title: "Deutschlandlied", author: "Germany", year: "1922", type: "Song" },
                { title: "Hymn to Liberty", author: "Greece", year: "1865", type: "Song" },
                { title: "State Anthem of the Russian Federation", author: "Russia", year: "2000", type: "Song" },
                { title: "Jana Gana Mana", author: "India", year: "1950", type: "Song" },
                { title: "Nkosi Sikelel' iAfrika", author: "South Africa", year: "1997", type: "Song" },
                { title: "Advance Australia Fair", author: "Australia", year: "1984", type: "Song" },
                { title: "O Canada", author: "Canada", year: "1980", type: "Song" },
                { title: "Il Canto degli Italiani", author: "Italy", year: "1946", type: "Song" },
                { title: "A Portuguesa", author: "Portugal", year: "1911", type: "Song" },
                { title: "Hatikvah", author: "Israel", year: "2004", type: "Song" }
            ]
        },
        {
            category: "Historical & Revolutionary",
            icon: Zap,
            desc: "Songs of movement, revolution, and history.",
            items: [
                { title: "The Internationale", author: "Socialist", year: "1871", type: "Song" },
                { title: "Bella Ciao", author: "Italian Partisans", year: "1943", type: "Song" },
                { title: "Solidarity Forever", author: "Labor Union", year: "1915", type: "Song" },
                { title: "State Anthem of the USSR", author: "Soviet Union", year: "1944", type: "Song" },
                { title: "Horst-Wessel-Lied", author: "Historical (Banned)", year: "1930", type: "Song" },
                { title: "Rule, Britannia!", author: "British Empire", year: "1740", type: "Song" },
                { title: "Battle Hymn of the Republic", author: "Union (USA)", year: "1861", type: "Song" },
                { title: "Dixie", author: "Confederacy (USA)", year: "1859", type: "Song" },
                { title: "Preussens Gloria", author: "Prussia", year: "1871", type: "Song" }
            ]
        }
    ],
    "Universities": [
        {
            category: "Top Rated Global Institutions",
            icon: Landmark,
            desc: "World leading universities in political and international studies. Type to search worldwide.",
            items: [
                { title: "Harvard University", author: "United States", year: "US", type: "Document" },
                { title: "University of Oxford", author: "United Kingdom", year: "GB", type: "Document" },
                { title: "Sciences Po", author: "France", year: "FR", type: "Document" },
                { title: "London School of Economics and Political Science", author: "United Kingdom", year: "GB", type: "Document" },
                { title: "Princeton University", author: "United States", year: "US", type: "Document" },
                { title: "Stanford University", author: "United States", year: "US", type: "Document" },
                { title: "Yale University", author: "United States", year: "US", type: "Document" },
                { title: "University of Cambridge", author: "United Kingdom", year: "GB", type: "Document" }
            ]
        }
    ],
    "LOC": [
        {
            category: "US Library of Congress",
            icon: FileText,
            desc: "Search millions of records from the Library of Congress. Type above to begin.",
            items: [
                { title: "Constitution of the United States", author: "Founding Fathers", year: "1787", type: "Document" },
                { title: "Declaration of Independence", author: "Thomas Jefferson", year: "1776", type: "Document" },
                { title: "Gettysburg Address", author: "Abraham Lincoln", year: "1863", type: "Document" }
            ]
        }
    ]
};

// Top level categories for sidebar
const ROOT_CATEGORIES = [
    { id: 'Books', label: 'Books', icon: Book, desc: 'Seminal Works & Treatises' },
    { id: 'Documents', label: 'Documents', icon: Archive, desc: 'Primary Source Material' },
    { id: 'Journals', label: 'Journals', icon: FileText, desc: 'Academic Periodicals' },
    { id: 'Anthems', label: 'Anthems', icon: Music, desc: 'National Songs & Lyrics' },
    { id: 'Arts', label: 'Arts & Imagery', icon: ImageIcon, desc: 'Political Visual Arts' },
    { id: 'Universities', label: 'Universities', icon: Landmark, desc: 'Global Academic Institutions' },
    { id: 'LOC', label: 'Library of Congress', icon: FileText, desc: 'US National Archives' },
];

const LibraryTab: React.FC<LibraryTabProps> = ({ onNavigate, onAddToCompare, onToggleSave, isSaved }) => {
  const [activeRootTab, setActiveRootTab] = useState<string>('Books');
  const [searchQuery, setSearchQuery] = useState('');
  const [directReadQuery, setDirectReadQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Open Library API state
  const [openLibraryResults, setOpenLibraryResults] = useState<any[]>([]);
  const [isSearchingOL, setIsSearchingOL] = useState(false);

  // Arts API State
  const [artResults, setArtResults] = useState<any[]>([]);
  const [isSearchingArt, setIsSearchingArt] = useState(false);
  const [defaultArts, setDefaultArts] = useState<any[]>([]);

  // Universities API State
  const [universityResults, setUniversityResults] = useState<any[]>([]);
  const [isSearchingUni, setIsSearchingUni] = useState(false);

  // LOC API State
  const [locResults, setLocResults] = useState<any[]>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  // Fetch Default Arts once
  React.useEffect(() => {
     const fetchArts = async () => {
         try {
             setIsSearchingArt(true);
             const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=politics,history&limit=15&fields=id,title,artist_display,image_id,date_display`);
             const data = await res.json();
             if (data.data) {
                 const mapped = data.data.filter((d:any) => d.image_id).map((doc: any) => ({
                    title: doc.title,
                    author: doc.artist_display || 'Unknown Artist',
                    year: doc.date_display || '',
                    type: 'Art',
                    coverUrl: `https://www.artic.edu/iiif/2/${doc.image_id}/full/400,/0/default.jpg`
                 }));
                 setDefaultArts([{
                     category: "Global Art Archives (Art Institute of Chicago)",
                     icon: ImageIcon,
                     desc: "Historical and political visual arts.",
                     items: mapped
                 }]);
             }
         } catch (e) {
             console.warn(e);
         } finally {
             setIsSearchingArt(false);
         }
     };
     fetchArts();
  }, []);

  React.useEffect(() => {
    if (searchQuery.length < 3) {
      setOpenLibraryResults([]);
      setArtResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      // Books/OpenLibrary
      if (activeRootTab === 'Books' || activeRootTab === 'Documents' || activeRootTab === 'Journals') {
          setIsSearchingOL(true);
          try {
            const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=8`);
            const data = await res.json();
            if (data.docs) {
              const formatted = data.docs.map((doc: any) => ({
                title: doc.title,
                author: doc.author_name ? doc.author_name[0] : 'Unknown',
                year: doc.first_publish_year ? doc.first_publish_year.toString() : 'Unknown',
                type: 'Book',
                cover_i: doc.cover_i
              }));
              setOpenLibraryResults(formatted);
            }
          } catch (err) {
            console.error("OpenLibrary search failed", err);
          } finally {
            setIsSearchingOL(false);
          }
      }
      
      // Art/Chicago
      if (activeRootTab === 'Arts') {
         setIsSearchingArt(true);
         try {
             const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchQuery)}&limit=8&fields=id,title,artist_display,image_id,date_display`);
             const data = await res.json();
             if (data.data) {
                 const mapped = data.data.filter((d:any) => d.image_id).map((doc: any) => ({
                    title: doc.title,
                    author: doc.artist_display || 'Unknown Artist',
                    year: doc.date_display || '',
                    type: 'Art',
                    coverUrl: `https://www.artic.edu/iiif/2/${doc.image_id}/full/400,/0/default.jpg`
                 }));
                 setArtResults(mapped);
             }
         } catch(e) {
             console.warn(e);
         } finally {
             setIsSearchingArt(false);
         }
      }

      // Universities API
      if (activeRootTab === 'Universities') {
          setIsSearchingUni(true);
          try {
              const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(searchQuery)}&limit=12`);
              const data = await res.json();
              if (data && data.length > 0) {
                  // The API returns an array, sometimes highly duplicated, limit to 10 unique
                  const uniqueNames = new Set();
                  const results = [];
                  for (let doc of data) {
                      if (!uniqueNames.has(doc.name)) {
                          uniqueNames.add(doc.name);
                          results.push({
                              title: doc.name,
                              author: doc.country,
                              year: doc.alpha_two_code,
                              type: 'Document', // We can open it in Reader 
                              coverUrl: null
                          });
                      }
                      if (results.length >= 8) break;
                  }
                  setUniversityResults(results);
              }
          } catch(e) {
              console.warn("Universities API failed", e);
          } finally {
              setIsSearchingUni(false);
          }
      }

      // LOC API
      if (activeRootTab === 'LOC') {
          setIsSearchingLoc(true);
          try {
              const res = await fetch(`https://www.loc.gov/search/?q=${encodeURIComponent(searchQuery)}&fo=json&c=8`);
              const data = await res.json();
              if (data && data.results) {
                  const results = data.results.filter((r: any) => r.title).map((r: any) => ({
                      title: r.title,
                      author: r.contributor ? r.contributor[0] : 'Library of Congress',
                      year: r.date || 'Unknown',
                      type: 'Document',
                      coverUrl: r.image_url && r.image_url.length > 0 ? r.image_url[0] : null
                  }));
                  setLocResults(results);
              }
          } catch(e) {
              console.warn("LOC API failed", e);
          } finally {
              setIsSearchingLoc(false);
          }
      }

    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeRootTab]);

  // Filter Logic
  const currentData = activeRootTab === 'Arts' ? defaultArts : (LIBRARY_HIERARCHY[activeRootTab] || []);
  
  const filteredData = useMemo(() => {
      if (!searchQuery) return currentData;
      const lowerQuery = searchQuery.toLowerCase();
      
      let localResults = currentData.map(cat => ({
          ...cat,
          items: cat.items.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.author.toLowerCase().includes(lowerQuery)
          )
      })).filter(cat => cat.items.length > 0);
      
      if (activeRootTab === 'Books' && (openLibraryResults.length > 0 || isSearchingOL)) {
          localResults.push({
              category: "Global Archives (Open Library)",
              icon: Globe,
              desc: isSearchingOL ? "Searching the world's knowledge..." : "Results from the open web.",
              items: openLibraryResults
          });
      }

      if (activeRootTab === 'Arts' && (artResults.length > 0 || isSearchingArt)) {
           localResults.push({
              category: "Global Art Archives (Art Institute of Chicago)",
              icon: Globe,
              desc: isSearchingArt ? "Searching..." : "Results from the open web.",
              items: artResults
          });
      }

      if (activeRootTab === 'Universities' && (universityResults.length > 0 || isSearchingUni)) {
          localResults.push({
              category: "Global Academic Institutions Directory",
              icon: Landmark,
              desc: isSearchingUni ? "Searching directory..." : "Results from the open web.",
              items: universityResults
          });
      }

      if (activeRootTab === 'LOC' && (locResults.length > 0 || isSearchingLoc)) {
          localResults.push({
              category: "United States Library of Congress",
              icon: FileText,
              desc: isSearchingLoc ? "Searching National Archives..." : "Results from the Library of Congress.",
              items: locResults
          });
      }
      
      return localResults;
  }, [currentData, searchQuery, openLibraryResults, activeRootTab, isSearchingOL, artResults, isSearchingArt, universityResults, isSearchingUni, locResults, isSearchingLoc]);

  const handleDirectRead = (e: React.FormEvent) => {
      e.preventDefault();
      if (directReadQuery.trim()) {
          playSFX('swoosh');
          onNavigate('Reader', { title: directReadQuery, author: 'Direct Access', type: 'Document' });
          setDirectReadQuery('');
      }
  };

  const handleItemClick = (item: any) => {
      playSFX('click');
      onNavigate('Reader', { title: item.title, author: item.author, type: item.type });
  };

  const handleSave = (item: any) => {
      onToggleSave({ 
          id: `saved_${item.type}_${Date.now()}`, 
          type: item.type, 
          title: item.title, 
          subtitle: item.author, 
          dateAdded: new Date().toLocaleDateString() 
      });
      setActiveMenu(null);
  };

  const renderMenu = (item: any) => (
      <div className="absolute right-2 top-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-30 min-w-[140px] rounded-lg overflow-hidden animate-in zoom-in-95 origin-top-right">
          <button 
            onClick={(e) => { e.stopPropagation(); handleSave(item); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-2"
          >
              <Bookmark className={`w-3 h-3 ${isSaved(item.title, item.type) ? 'fill-academic-gold text-academic-gold' : ''}`} /> 
              {isSaved(item.title, item.type) ? 'Saved' : 'Save'}
          </button>
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-academic-bg dark:bg-stone-950 relative" onClick={() => setActiveMenu(null)}>
        
        {/* 1. HEADER (Search & Breadcrumbs) */}
        <div className="bg-academic-paper dark:bg-stone-900 border-b border-academic-line dark:border-stone-800 p-3 sm:p-4 shadow-sm z-20 sticky top-0 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                <div className="p-2 bg-academic-gold/10 rounded-lg text-academic-gold hidden sm:block">
                    <Library className="w-5 h-5" />
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                    <input 
                        type="text" 
                        placeholder={`Filter ${activeRootTab}...`}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-academic-line dark:border-stone-700 rounded-md text-sm font-serif focus:border-academic-accent dark:focus:border-indigo-500 outline-none transition-all focus:bg-white dark:focus:bg-stone-800 text-academic-text dark:text-stone-200 placeholder-stone-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 overflow-x-auto no-scrollbar whitespace-nowrap px-1">
                <span className="text-stone-500 dark:text-stone-300 font-bold">Library</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-academic-gold font-bold">{activeRootTab}</span>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* 2. SIDEBAR (Desktop) */}
            <div className="w-64 bg-white dark:bg-stone-900 border-r border-academic-line dark:border-stone-800 overflow-y-auto flex-shrink-0 hidden lg:block h-full">
                <div className="p-4 space-y-1">
                    {ROOT_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveRootTab(cat.id); setSearchQuery(''); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all text-left
                            ${activeRootTab === cat.id ? 'bg-stone-100 dark:bg-stone-800 text-academic-accent dark:text-indigo-400 border-l-4 border-academic-accent dark:border-indigo-500' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 border-l-4 border-transparent'}`}
                        >
                            <cat.icon className={`w-4 h-4 ${activeRootTab === cat.id ? 'text-academic-gold' : 'text-stone-400 dark:text-stone-500'}`} />
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. MAIN CONTENT GRID */}
            <div className="flex-1 overflow-y-auto bg-stone-50/30 dark:bg-black/30 p-4 md:p-8 pb-32">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header Info */}
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 flex items-center gap-4 border-b border-academic-line dark:border-stone-800 pb-6">
                        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm text-academic-gold">
                            {React.createElement(ROOT_CATEGORIES.find(c => c.id === activeRootTab)?.icon || Book, { className: "w-8 h-8" })}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-academic-text dark:text-stone-100">{ROOT_CATEGORIES.find(c => c.id === activeRootTab)?.label}</h1>
                            <p className="text-stone-500 dark:text-stone-400 font-serif italic text-sm">{ROOT_CATEGORIES.find(c => c.id === activeRootTab)?.desc}</p>
                        </div>
                    </div>

                    {/* Mobile Selector */}
                    <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar flex gap-2 pb-2">
                            {ROOT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveRootTab(cat.id); setSearchQuery(''); }}
                                className={`flex-none flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap transition-colors
                                ${activeRootTab === cat.id ? 'bg-academic-accent dark:bg-indigo-600 text-white border-academic-accent dark:border-indigo-600' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'}`}
                            >
                                <cat.icon className="w-3 h-3" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* DIRECT ACCESS INPUT */}
                    <div className="mb-8 bg-academic-accent dark:bg-indigo-900 p-6 rounded-lg shadow-md animate-in fade-in slide-in-from-top-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 flex items-center gap-2 relative z-10">
                            <BookOpen className="w-3 h-3" /> Quick Access
                        </h3>
                        <form onSubmit={handleDirectRead} className="relative flex gap-2 z-10">
                            <input 
                                type="text"
                                placeholder="Enter title of any book, document, or anthem to launch reader..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-md px-4 py-3 text-white placeholder-white/40 font-serif text-sm focus:outline-none focus:bg-white/20 focus:border-academic-gold transition-colors"
                                value={directReadQuery}
                                onChange={(e) => setDirectReadQuery(e.target.value)}
                            />
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-academic-gold text-white font-bold uppercase text-xs tracking-widest rounded-md hover:bg-yellow-600 transition-colors shadow-lg"
                            >
                                Open
                            </button>
                        </form>
                    </div>

                    {/* CURATED COLLECTIONS (Dynamic Links) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                         <div 
                             onClick={() => onNavigate('Explore', { search: 'Constitution' })}
                             className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 cursor-pointer group shadow-sm transition-all"
                         >
                             <div className="flex justify-between items-start">
                                 <div>
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Curated Collection</span>
                                     <h3 className="text-lg font-serif font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400">Constitutions of the World</h3>
                                 </div>
                                 <Scroll className="w-8 h-8 text-stone-300 dark:text-stone-600 group-hover:text-academic-gold transition-colors" />
                             </div>
                         </div>
                         <div 
                             onClick={() => setActiveRootTab('Books')}
                             className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-academic-accent dark:hover:border-indigo-500 cursor-pointer group shadow-sm transition-all"
                         >
                             <div className="flex justify-between items-start">
                                 <div>
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Curated Collection</span>
                                     <h3 className="text-lg font-serif font-bold text-academic-text dark:text-stone-100 group-hover:text-academic-accent dark:group-hover:text-indigo-400">Political Theory Classics</h3>
                                 </div>
                                 <Brain className="w-8 h-8 text-stone-300 dark:text-stone-600 group-hover:text-academic-gold transition-colors" />
                             </div>
                         </div>
                    </div>

                    {/* MAIN CONTENT LIST */}
                    {filteredData.length > 0 ? (
                        <div className="space-y-10 animate-in fade-in duration-500">
                            {filteredData.map((section, idx) => (
                                <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm break-inside-avoid">
                                    <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center gap-3">
                                        <div className="p-1.5 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 shadow-sm text-academic-gold">
                                            {React.createElement(section.icon, { className: "w-4 h-4" })}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-academic-text dark:text-stone-100 font-serif">{section.category}</h3>
                                            <p className="text-[10px] text-stone-400 uppercase tracking-wider">{section.desc}</p>
                                        </div>
                                        <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 px-2 py-0.5 rounded-full ml-auto">{section.items.length}</span>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {section.items.map((item, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => handleItemClick(item)} 
                                                className="flex flex-col justify-between p-4 rounded-lg bg-stone-50 dark:bg-stone-800/40 hover:bg-white dark:hover:bg-stone-800 border border-transparent hover:border-academic-accent/30 dark:hover:border-indigo-500/30 hover:shadow-md cursor-pointer transition-all group h-full relative"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    {item.coverUrl ? (
                                                        <ImageWithFallback src={item.coverUrl} alt="cover" className="w-12 h-12 object-cover rounded shadow-sm border border-stone-200 dark:border-stone-700" />
                                                    ) : item.cover_i ? (
                                                        <ImageWithFallback src={`https://covers.openlibrary.org/b/id/${item.cover_i}-S.jpg`} alt="cover" className="w-8 h-12 object-cover rounded shadow-sm border border-stone-200 dark:border-stone-700" />
                                                    ) : (
                                                        <div className={`p-2 rounded-lg bg-white dark:bg-stone-700 shadow-sm text-stone-400 dark:text-stone-400 group-hover:text-academic-accent dark:group-hover:text-indigo-400 transition-colors`}>
                                                            {activeRootTab === 'Anthems' ? <Music className="w-4 h-4" /> : activeRootTab === 'Arts' ? <ImageIcon className="w-4 h-4" /> : activeRootTab === 'Universities' ? <Landmark className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.title ? null : item.title); }}
                                                        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-full text-stone-300 dark:text-stone-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                    {activeMenu === item.title && renderMenu(item)}
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 group-hover:text-academic-text dark:group-hover:text-white line-clamp-2 leading-snug font-serif mb-1">{item.title}</h4>
                                                    <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wider">
                                                        <span className="truncate max-w-[70%]">{item.author}</span>
                                                        <span>{item.year}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute inset-0 border-2 border-academic-gold opacity-0 group-hover:opacity-0 pointer-events-none rounded-lg transition-opacity"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 opacity-50">
                            <Search className="w-16 h-16 text-stone-300 dark:text-stone-700 mb-6" />
                            <p className="font-serif italic text-stone-500 dark:text-stone-400 text-lg">No archives found matching "{searchQuery}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default LibraryTab;
