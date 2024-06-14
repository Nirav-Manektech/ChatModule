import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Channel, useChatContext } from 'stream-chat-react';
import "./styles/CustomMessage.css";

const CustomSearch = (props) => {
    const { client } = useChatContext();
    const [query, setQuery] = useState('');
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState('');
    const { setIsSearchQuery } = props;

    const handleChannelSearchClick = async () => {
        searchParams.set('type', 'channel');
        searchParams.set('query', query);
        await querySearchResults();
    };

    const handleUserSearchClick = async () => {
        searchParams.set('type', 'user');
        searchParams.set('query', query);
        await querySearchResults();
    };

    const handleMessageSearchClick = async () => {
        console.log("in message search")
        searchParams.set('type', 'message');
        searchParams.set('query', query);
        await querySearchResults();
    };

    const querySearchResults = useCallback(async () => {
        // setIsSearchQuery(true)
        const type = searchParams.get('type');
        const query = searchParams.get('query');

        if (!type || !query) {
            console.error('Type or query is missing');
            return;
        }

        const searchDocuments = async () => {
            switch (type) {
                case 'channel':
                    return await client.queryChannels(
                        {
                            type: 'messaging',
                            name: { $autocomplete: query },
                            members: { $in: [client.user.id] },
                        },
                        { last_message_at: -1, updated_at: -1 },
                        { limit: 5 },
                        {include: ['user']}
                    );
                case 'user':
                    const { users } = await client.queryUsers(
                        {
                            $or: [{ id: { $autocomplete: query } }, { name: { $autocomplete: query } }],
                            id: { $ne: client.user.id },
                        },
                        { id: 1, name: 1 },
                        { limit: 5 },
                    );
                    console.log(users, "users")
                    return users;
                case 'message':
                    const searchResults1 = await client.search(
                        { type: 'messaging', members: { $in: [client.user.id] } },
                        query,
                        { limit: 5 },
                    );
                    const messages = searchResults1.results.map((item) => item.message);
                    console.log("messages", messages)
                    return messages
                default:
                    console.error('Unknown search type');
                    break;
            }
        }
        console.log("query123", query, "type", type)
        setSearchResults({
            entity: type,
            items: await searchDocuments(),
        })
    }, []);

    // useEffect(() => {
    //     if (!searchParams.type && !searchParams.query) {
    //         setIsSearchQuery(false)
    //     }
    // }, [searchParams, setIsSearchQuery])

    const ChannelSearchResultPreview = ({ channel }) => {
        const { setActiveChannel } = useChatContext();

        const handleClick = () => {
            // setIsSearchQuery(false)
            setActiveChannel(channel);
        };

        return (
            <li className='search-results__item' onClick={handleClick}>
                <div className='search-results__icon'>#️⃣</div>
                {channel.data?.name}
            </li>
        );
    };

    const UserSearchResultPreview = ({ user }) => {
        const { client, setActiveChannel } = useChatContext();

        const handleClick = async () => {
            // setIsSearchQuery(false)
            const channel = client.channel('messaging', { members: [client.user.id, user.id] });
            await channel.watch();
            setActiveChannel(channel);
        };

        return (
            <li className='search-results__item' onClick={handleClick}>
                <div className='search-results__icon'>
                    <img src={user.image} alt="user icon" className='search-results__img-icon' />
                </div>
                {user.name ?? user.id}
            </li>
        );
    };

    const MessageSearchResultPreview = ({ message }) => {
        const { client, setActiveChannel } = useChatContext();

        const channel = client.channel(message.channel.type, message.channel.id);
        const handleClick = async () => {
            // setIsSearchQuery(false)
            if (message.channel) {
                setActiveChannel(channel);
                await channel.state.loadMessageIntoState(message.id);
                // Note: The way to handle navigation might vary based on your routing setup
                // Make sure to adjust this according to your actual implementation
                window.location.hash = message.id;
            }
        };
        const receiverName = message.user.name === client.user.name ? channel.name : message.user.name;


        return (
            <li className='search-results__item' onClick={handleClick}>
                
                <div className='search-results__icon'>
                    <img src={message.user.image} alt="user icon" className='search-results__img-icon' />
                </div>
                <div className='search-results__iconContainer'>
                    {receiverName ?? message?.channel?.created_by?.id}
                
                <div className='search-results__iconWrapper'>
                <div className='search-results__icon'>💬</div>
                    {message.text}
                    </div>
                </div>
            </li>
        );
    };

    const SearchResultsPreview = ({ searchResults }) => {
        // const [searchParams] = useSearchParams();
        const type = searchParams.get('type');


        console.log("type==============>", type, searchParams)
        // Render nothing if no type or query is present
        if (!type) return <></>;


        // const results = querySearchResults();
        // console.log("results", results)

        if (!searchResults || searchResults.items.length === 0) {
            return <div>No searchResults</div>;
        }
        console.log("searchResults", searchResults)
        return (
            <ul className='search-results'>
                {type === 'channel' &&
                    searchResults.items.map((item) => <ChannelSearchResultPreview key={item.cid} channel={item} />)}
                {type === 'user' &&
                    searchResults.items.map((item) => <UserSearchResultPreview key={item.id} user={item} />)}
                {type === 'message' &&
                    searchResults.items.map((item) => <MessageSearchResultPreview key={item.id} message={item} />)}
            </ul>
        );
    };
    return (
        <div className='search'>
            <div className='user__profile-wrapper'>
                <img src={client.user.image} alt="user icon" className='user__profile-img' />
                <div className='user__profile-name'>{client.user.name}</div>
                <div className='user__profile-email'>{client.user.email}</div>
            </div>
            <input
                type='search'
                className='search-input'
                value={query}
                placeholder='Search'
                onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
                <div className='search-actions'>
                    {/* <button type='button' className='search-button' onClick={handleChannelSearchClick}>
                        #️⃣ Find <strong>"{query}"</strong> channels
                    </button> */}
                    <button type='button' className='search-button' onClick={handleUserSearchClick}>
                        👤 Find <strong>"{query}"</strong> users
                    </button>
                    <button type='button' className='search-button' onClick={handleMessageSearchClick}>
                        💬 Look up <strong>"{query}"</strong> in messages
                    </button>
                </div>
            )}
            {query && (<SearchResultsPreview searchResults={searchResults} />)}
            
        </div>
    );
};


export default CustomSearch;

