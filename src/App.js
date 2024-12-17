import './stylesheets/App.scss';
import logo from './assets/images/logo.svg';
import dropdownlogo from './assets/images/icon-arrow-down.svg';
import iconSearch from './assets/images/icon-search.svg';
import iconPlay  from './assets/images/icon-play2.svg';
import iconPause  from './assets/images/icon-pause.svg';
import iconNewWindow  from './assets/images/icon-new-window.svg';
import iconSmily from './assets/images/smily.png';

import { useSearchObjects } from './contexts/searchcontext';

import { useContext, useEffect, useRef, useState } from 'react';

function App() {

  
  
  return (
    

    <div className="App">
        <AppHeader/>
        <section>
          <div className='container'>
              <div className='dictionary-body'>
                <SearchBar/>
                <SearchResult/>
              

              </div>
          </div>
        </section>
    </div>
    

  );
}

export default App;

const SearchBar=()=>{
const {searchKeyWord, updateSearchKeyword, getFinalWord, inputError, inputRef } = useSearchObjects();
  return(
    <div className='searchBar'>
      <div ref={inputRef} className='searchHolder'>
      <input type='text' 
      value={searchKeyWord} 
      placeholder='Search for any word…' 
      onChange={updateSearchKeyword}  
      onKeyDown={(event) => {
          if (event.key === 'Enter') {
            getFinalWord();
          }
        }}
        />
        
        <button className='searchBtn' onClick={getFinalWord}>
          <img src={iconSearch} alt=''/>
        </button>
      </div>

      {inputError && (
          <p className='inputerror'>{inputError}</p>
      )}
    </div>
  )
}
export {SearchBar}


const SearchResult=()=>{
  const {finalWord} = useSearchObjects();

  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound,setNotFound] = useState([]);

  useEffect(() => {
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);


      try {

          setResultData([]);
        setNotFound([]);
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${finalWord}`);

       
        const result = await response.json();

        if (!response.ok) {
         
         //  throw new Error(`HTTP error! Status: ${response.status}`);
         
          if(response.status === 404){
            setNotFound(result);
          }
        
        }else{  
            setResultData(result);
       
        }
      
      } catch (err) {
        setError(err.message); // Set the error state
      
      } finally {
        setLoading(false); // Ensure loading is stopped
      }
    };
      fetchData();
    
  }, [finalWord]); 

  if (loading) {
    return <LoadingScreen/>;
  }

  return (
    <>
      {finalWord ? (
        (resultData.length > 0) ? <ResultsView fetchedResultData={resultData} /> : <EmptyResult noresult={notFound}/>
      ) : (
        <EmptySearch/>
      )}
     
    </>
  )
}
export {SearchResult}

const LoadingScreen=()=>{
  return(
    <div className='empty-search'>
          <p className='smiley'>🔎</p>
    <p className='emptyHeading'>Please wait while I search for definition for you</p>
   
   </div>
  )
}
export {LoadingScreen}




const ResultsView=(props)=>{
  const fetchedData = props.fetchedResultData;


  const audioActions=(audioPlayer, audioTrigger)=>{
    if (audioPlayer) {
      if (audioPlayer.paused) {
        audioPlayer.play();
        audioTrigger.classList.add('playing');
        audioPlayer.onended = () => {
          audioTrigger.classList.remove('playing');
        };
      } else {
        audioPlayer.pause();
        audioTrigger.classList.remove('playing');
      }
    }
  }

  const handleAudioPlaying = (e) => {
    const audioContainer = e.currentTarget;
    const audio = audioContainer.querySelector('audio');
    audioActions(audio, audioContainer);
  };

  const playBtnRef = useRef(null);

  const handlePhoneticAudioSelect=(e)=>{

    const audioIndex = e.target.getAttribute('data-key');
    const playingAudio = playBtnRef.current.querySelector(`audio[data-key='${audioIndex}']`);
    audioActions(playingAudio,  playBtnRef.current);
  
  }
  return(
    <div className='search-results_wrapper'>

  
        <div className='topbar'>
          <div className='word'>
            <p className='keyword'>{fetchedData?.[0].word}</p>
            <div className='phonetics'>
              {fetchedData?.[0]?.phonetics?.map((phonetic, index)=>(
                phonetic.text &&  phonetic.audio && (
                  <button key={index} className='phonetic' title='play phonetic' onClick={handlePhoneticAudioSelect} data-key={index}>{phonetic.text}</button>
                )
              ))}
            </div>
          </div>
          <button className='audio' onClick={handleAudioPlaying} ref={playBtnRef}>
              {fetchedData?.[0]?.phonetics?.map((phonetic, index)=>(
                 phonetic.text &&  phonetic.audio &&  (
                  <audio key={index} data-key={index} >
                  <source src={phonetic.audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                )
              ))}
           
            <div className='audioicons playicon'>
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0V21L21 10.5L0 0Z" fill="currentColor"/>
              </svg>
            </div>
            <div className='audioicons pauseicon'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" fill="currentColor"/></svg>
            </div>

          </button>
        </div>
      


    <div className='meanings'>

    {fetchedData?.[0]?.meanings?.map((meaning, index)=>(
        <div key={index} className='meanings__group'>
            <div className='partsOfSpeech'>
              <p>{meaning.partOfSpeech}</p>
              <div className='separator'></div>
            </div>
            <div className='definitionsGroup'>
              <p className='title'>Meaning</p>
              <ul>
                {meaning.definitions && meaning.definitions.map((definition, index) => (
                  <li key={index}>{definition.definition}
                    {definition.example && (
                      <span className='exampletext'>"{definition.example}"</span>
                    )}
                    {(definition.synonyms && definition.synonyms.length > 0) || (definition.antonyms && definition.antonyms.length > 0) && (
                      <div className='def-syn-an'>
                        {definition.synonyms && definition.synonyms.length > 0 && (
                          <p className='def-synonyms'>Synonyms: {definition.synonyms.map((synonym, index) => (
                            <span key={index}>{synonym}</span>
                          ))}</p>
                        )}
                        {definition.antonyms && definition.antonyms.length > 0 && (
                          <p className='def-antonyms'>Antonyms: {definition.antonyms.map((antonym, index) => (
                            <span key={index}>{antonym}</span>
                          ))}</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

            </div>
            {meaning.synonyms.length > 0 && (
               <div className='synonyms syn-an'>
                  Synonyms 
                  {meaning?.synonyms?.map((syn,index)=>(
                    <span key={index}>{syn} ,</span>
                  ))}
              </div>
            )}
            
            {meaning.antonyms.length > 0 && (
               <div className='antonyms syn-an'>
                  Antonyms 
                  {meaning?.antonyms?.map((ant,index)=>(
                    <span key={index}>{ant} ,</span>
                  ))}
                
              </div>
            )}
        </div>
         ))}

    </div>

    {fetchedData?.[0]?.sourceUrls && (
       
          <div className='source'>
                <p>Source</p>
                <div className='sourceUrls'>
                    { fetchedData?.[0]?.sourceUrls.map((sourceUrl, index) => (
                        <div key={index} className='sourceurl'>
                          <a href={sourceUrl} target='_blank' rel='noreferrer'>{sourceUrl}</a>
                            <img src={iconNewWindow} className='newWindowIcon' alt=''/>
                          </div>
                    ))}
                </div>
              </div>

       
    )}



  </div>
  )
}
export {ResultsView};

const EmptySearch=()=>{
  return(
    <div className='empty-search'>
        <p className='smiley'>😀</p>
      <p className='emptyHeading'>Search Something</p>
      <p className='emptyText'>Type a word and click search and I will try to get the definition for you</p>
    
     </div>
  )
}
export {EmptySearch};


const EmptyResult=(props)=>{
  return(
    <div className='empty-search'>
      <img src={iconSmily} alt=''/>
      <p className='emptyHeading'>{props.noresult['title']}</p>
      <p className='emptyText'>{props.noresult['message']} {props.noresult['resolution']}</p>
    </div>
  )
}
export {EmptyResult};

const AppHeader = () => {
  return (
    <header>
        <div className='container'>
          <div className='header-wrapper'>
              <img src={logo} alt="Logo"/>
              <div className='right-toggles'>
                  <FontFamToggle/>
                  <ThemeSwitcher/>
              </div>
          </div>
        </div>
    </header>
  
  )
}
export {AppHeader};

const FontFamToggle=()=>{

  const [siteFont, setSiteFont] = useState('sans-serif');

  const handleselectFont=(e)=>{

    const selectedFont = e.target.getAttribute('data-selectfont');
    setSiteFont(selectedFont);
    document.documentElement.setAttribute('data-font', selectedFont);
  }
  return(
    <div className={`font-toggle`}>
      <p className='font-fam clr-prime'>Sans Serif</p>
      <img src={dropdownlogo} alt=''/>
      <div className='options clr-prime-reverse bg-prime-reverse'>
          <ul>
            <li data-selectfont="sans-serif" onClick={handleselectFont}>Sans Serif</li>
            <li data-selectfont="serif" onClick={handleselectFont}>Serif</li>
            <li data-selectfont="mono" onClick={handleselectFont}>Mono</li>
          </ul>
      </div>
    </div>
  )
}

export {FontFamToggle}


const ThemeSwitcher=()=>{
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return(
   <div className='switcher-hold'>
      <div className='switcher'>
        <input type='checkbox' checked={isDark} onChange={toggleTheme}/>
        <div className='pointer'></div>
      </div>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M1 10.449C0.998458 12.8283 1.80169 15.1383 3.27914 17.0033C4.75659 18.8683 6.82139 20.1788 9.13799 20.7218C11.4545 21.2647 13.8866 21.0082 16.039 19.994C18.1912 18.9797 19.9373 17.2673 20.9931 15.1352C11.5442 15.1352 6.85799 10.4479 6.85799 1C5.09842 1.87311 3.61767 3.22033 2.58266 4.88981C1.54765 6.5593 0.999502 8.48469 1 10.449Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

    </div>
  )
}
export {ThemeSwitcher}

