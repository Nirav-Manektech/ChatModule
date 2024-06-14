import React,{ useState } from "react";

const CustomSearch = () => {
    const [query, setQuery] = useState('');

    return (
        <div className='search'>
            <input
                type='search'
                className='search-input'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
                <div className='search-actions'>
                    <button type='button' className='search-button'>
                        #️⃣ Find "{query}" channels
                    </button>
                    <button type='button' className='search-button'>
                        👤 Find "{query}" users
                    </button>
                    <button type='button' className='search-button'>
                        💬 Look up "{query}" in messages
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomSearch;
