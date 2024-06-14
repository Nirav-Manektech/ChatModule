import React, { useEffect, useState, useCallback } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  LoadingIndicator,
  MessageInput,
  Thread,
  Window,
  useChannelStateContext,
  useMessageContext,
  useTranslationContext,
  useDeleteHandler,
  MessageList,
  ChannelSearch
} from "stream-chat-react";
import { jwtDecode } from "jwt-decode";
import { MessageSimple } from 'stream-chat-react';
import "./styles/CustomMessage.css";
import { EmojiPicker } from 'stream-chat-react/emojis';


import "stream-chat-react/dist/css/index.css";
import CustomMessageUi from "./CustomMessageUi";
import CustomSearch from "./CustomSearch";
import { BrowserRouter, Router } from "react-router-dom";
import CustomChannelHeader from "./components/CustomHeader";



const sort = { last_message_at: -1 };

const App = () => {
  const token = localStorage.getItem("token");
  const [filters, setFilters] = useState({ type: "messaging", members: { $in: [jwtDecode(token).user_id] } })
  const [chatClient, setChatClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchQuery, setIsSearchQuery] = useState(false)
  const context = useChannelStateContext()

  useEffect(() => {
    const initChat = async () => {
      const client = StreamChat.getInstance("wfduxrtvehe2", { timeout: 6000 });
      await client.connectUser(
        {
          id: jwtDecode(token).user_id,
          name: jwtDecode(token).user_id,
          image:
            "https://getstream.io/random_png/?id=little-wood-9&name=little-wood-9"
        },
        token
      );
      setChatClient(client);
    };

    initChat();
  }, [token]);

  useEffect(() => {
    if (isSearchQuery) {
      setFilters({ type: "messaging", members: { $in: [jwtDecode(token).user_id] }, limit: 0 })
    }
    // else {
    //   setFilters({ type: "messaging", members: { $in: [jwtDecode(token).user_id] } })
    // }
  }, [isSearchQuery, token])

  if (!chatClient) {
    return <LoadingIndicator />;
  }



  const AppMenu = ({ close }) => {
    const handleSelect = useCallback(() => {
      // custom logic...
      close?.();
    }, [close]);

    return (
      <div className='app-menu__container'>
        <ul className='app-menu__item-list'>
          <li className='app-menu__item' onClick={handleSelect}>
            Profile
          </li>
          <li className='app-menu__item' onClick={handleSelect}>
            New Group
          </li>
          <li className='app-menu__item' onClick={handleSelect}>
            Sign Out
          </li>
        </ul>
      </div>
    );
  };

  const CustomMessageActionList = () => {
    const { message } = useMessageContext('CustomMessageActionList');
    const { t } = useTranslationContext('CustomMessageActionList');

    const deleteHandler = useDeleteHandler(message)
    if (message.user.id !== chatClient.user.id) {
      return <></>
    }
    return (
      <>
        <button
          className='str-chat__message-actions-list-item str-chat__message-actions-list-item-button'
          onClick={(event) => {
            deleteHandler(event)
          }}
        >
          {t('Delete')}
        </button>

        {/** ...other action buttons... */}
      </>
    );
  };


  const CustomSearchResultItem = ({ result, index, focusedUser, selectResult }) => {
    const isChannel = result.cid;
    console.log("isChannel", isChannel, result, index, selectResult, focusedUser)
    return (
      <button
        className={`search-result-item ${index === focusedUser ? 'search-result-item_focused' : ''}`}
        onClick={() => selectResult(result)}
      >
        {isChannel ? (
          <>
            <span className='search-result-item__icon'>#️⃣</span>
            {result.data?.name}
          </>
        ) : (
          <>
            <span className='search-result-item__icon'>👤</span>
            {result.name ?? result.id}
          </>
        )}
      </button>
    );
  };


  const getMessageActions = () => {
    return ["flag", "mute", "pin", "react", "reply"];

  };


  const CustomSearchHOC = () => {
    return <CustomSearch setIsSearchQuery={setIsSearchQuery} />
  }
  console.log("isSearchQuery", isSearchQuery)


// const WrappedChannel = ({ children }) => {
//   return <Channel EmojiPicker={EmojiPicker}>{children}</Channel>;
// };
  const List = () => {
    return <></>
  }

  return (
    <BrowserRouter>
      <Chat client={chatClient}>

        <Window>
          {/* {isSearchQuery ? <ChannelList filters={filters} sort={sort} showChannelSearch ChannelSearch={CustomSearchHOC} List={List} /> : <ChannelList filters={filters} sort={sort} showChannelSearch ChannelSearch={CustomSearchHOC} />} */}
          <ChannelList filters={filters} sort={sort} showChannelSearch ChannelSearch={CustomSearchHOC} />

        </Window>
        <Channel CustomMessageActionsList={CustomMessageActionList} EmojiPicker={EmojiPicker} >
          <Window>
            <CustomChannelHeader client={chatClient} />
            <MessageList messageActions={getMessageActions()} />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </BrowserRouter>
  );
};

export default App;
