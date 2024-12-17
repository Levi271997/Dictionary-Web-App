import { createContext, useContext, useRef, useState } from "react";

const SearchTermContext = createContext(null);

export const SearchProvider =({children})=>{

    const [searchKeyWord, setSearchKeyWord] = useState('');

    const [finalWord, setFinalWord] = useState('');

    const [inputError, setInputError]=  useState('');

    const inputRef=useRef(null);

    const updateSearchKeyword=(e)=>{
        setSearchKeyWord(e.target.value);
    }

    const getFinalWord = ()=>{
        if(searchKeyWord === ''){
            setInputError('Whoops, can’t be empty…');
            inputRef.current.classList.add('errtext');
        }else{
            setFinalWord(searchKeyWord);
            setInputError('');
             inputRef.current.classList.remove('errtext');
        }
       
       
    }

    return(
        <SearchTermContext.Provider value={{searchKeyWord, updateSearchKeyword,finalWord, getFinalWord, inputError, inputRef}}>
                {children}
        </SearchTermContext.Provider>
    )
}

export const useSearchObjects = ()=> useContext(SearchTermContext);