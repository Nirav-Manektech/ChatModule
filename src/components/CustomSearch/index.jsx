import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatContext } from 'stream-chat-react';
import "../../styles/CustomMessage.css";
import CloseIcon from '../SVGIcons/CloseIcon';

const CustomSearch = () => {
    const { client } = useChatContext();
    const [query, setQuery] = useState('');
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState('');

 
    const handleUserSearchClick = async () => {
        searchParams.set('type', 'user');
        searchParams.set('query', query);
        await querySearchResults();
    };

    const handleMessageSearchClick = async () => {
        searchParams.set('type', 'message');
        searchParams.set('query', query);
        await querySearchResults();
    };

    const querySearchResults = useCallback(async () => {
        const type = searchParams.get('type');
        const query = searchParams.get('query');

        if (!type || !query) {
            console.error('Type or query is missing');
            return;
        }

        const searchDocuments = async () => {
            switch (type) {
                case 'user':
                    const { users } = await client.queryUsers(
                        {
                            $or: [{ id: { $autocomplete: query } }, { name: { $autocomplete: query } }],
                            id: { $ne: client.user.id },
                        },
                        { id: 1, name: 1 },
                        { limit: 5 },
                    );

                    return users;
                case 'message':
                    const searchResults1 = await client.search(
                        {
                            type: 'messaging',
                            members: { $in: [client.user.id] }, // Include current user// Include receiver
                        },
                        query,
                        { limit: 5 },
                        { last_message_at: -1, updated_at: -1 },
                        { include: ['user', 'members'] },
                        { state: true, presence: true } // Include state and presence information

                    );

                    const detailedResults = await Promise.all(searchResults1.results.map(async (message) => {
                        // Fetch detailed channel information, including members list

                        const channelState = client.channel(message.message.channel.type, message.message.channel.id)
                        const receiver = {};
                        const members = channelState.state.members;
                        Object.keys(members).forEach(key => {
                            if (members[key].user.id !== client.user.id) {
                                receiver[key] = members[key];
                            }
                        });           
                        return {
                            ...message,
                            receiver
                        };
                    }));

                    return detailedResults
                default:
                    console.error('Unknown search type');
                    break;
            }
        }
        setSearchResults({
            entity: type,
            items: await searchDocuments(),
        })
    }, []);


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

        const channel = client.channel(message.message.channel.type, message.message.channel.id);
        const handleClick = async () => {
            // setIsSearchQuery(false)
            if (message.message.channel) {
                setActiveChannel(channel);
                await channel.state.loadMessageIntoState(message.message.id);
                // Note: The way to handle navigation might vary based on your routing setup
                // Make sure to adjust this according to your actual implementation
                window.location.hash = message.message.id;
            }
        };
        const receiverName = Object.entries(message.receiver)?.[0]?.[0]

        return (
            <li className='search-results__item' onClick={handleClick}>

                <div className='search-results__icon'>
                    <img src={message.message.user.image} alt="user icon" className='search-results__img-icon' />
                </div>
                <div className='search-results__iconContainer'>
                    {receiverName ?? message?.channel?.created_by?.id}

                    <div className='search-results__iconWrapper'>
                        <div className='search-results__icon'>💬</div>
                        {message.message.text}
                    </div>
                </div>
            </li>
        );
    };

    const SearchResultsPreview = ({ searchResults }) => {
        const type = searchParams.get('type');


        // Render nothing if no type or query is present
        if (!type) return <></>;


        if (!searchResults || searchResults.items.length === 0) {
            return <div className='search-results__no-search-text'>No searchResults</div>;
        }
        return (
            <ul className='search-results'>
                <p className='search-results__placeholder'>search results</p>
                {type === 'channel' &&
                    searchResults.items.map((item) => <ChannelSearchResultPreview key={item.cid} channel={item} />)}
                {type === 'user' &&
                    searchResults.items.map((item) => <UserSearchResultPreview key={item.id} user={item} />)}
                {type === 'message' &&
                    searchResults.items.map((item) => <MessageSearchResultPreview key={item.id} message={item} />)}
            </ul>
        );
    };

    const onDeleteClickHandler = () => {
        setQuery('');
        setSearchResults('');
    }
    return (
        <div className='search'>
            <div className='user__profile-wrapper'>
                <img src={client.user.image} alt="user icon" className='user__profile-img' />
                <div className='user__profile-name'>{client.user.name}{" "}(You)</div>
                <div className='user__profile-email'>{client.user.email}</div>
            </div>
            <div className='search-input__wrapper'>
                <input
                    type='search'
                    className='search-input'
                    value={query}
                    placeholder='Search'
                    onChange={(event) => setQuery(event.target.value)}
                />
                {query && (<CloseIcon className="search-input__close-icon" onClick={onDeleteClickHandler} />)}

            </div>
            {query && (
                <div className='search-actions'>
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

