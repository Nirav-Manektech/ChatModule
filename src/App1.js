import React, { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
  LoadingIndicator,
  MessageInput,
  Thread,
  Window,
  useMessageContext,
  useTranslationContext,
  useDeleteHandler,
  MessageList,

} from "stream-chat-react";
import { jwtDecode } from "jwt-decode";
import "./styles/CustomMessage.css";
import { EmojiPicker } from 'stream-chat-react/emojis';


import "stream-chat-react/dist/css/index.css";
import CustomSearch from "./components/CustomSearch";
import { BrowserRouter } from "react-router-dom";
import CustomChannelHeader from "./components/CustomHeader";



const sort = { last_message_at: -1 };

const App = () => {
  const token = localStorage.getItem("token");
  const [filters, setFilters] = useState({ type: "messaging", members: { $in: [jwtDecode(token).user_id] } })
  const [chatClient, setChatClient] = useState(null);
  const [isSearchQuery, setIsSearchQuery] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null); // Track the message being edited
  const inputRef = useRef(null);
  const STREAM_CHAT_ID = ''

  useEffect(() => {
    const initChat = async () => {
      const client = StreamChat.getInstance(STREAM_CHAT_ID, { timeout: 6000 });
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
 
  }, [isSearchQuery, token])

  if (!chatClient) {
    return <LoadingIndicator />;
  }


  const handleEdit = (message) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setEditingMessage(message);
  };



  const CustomMessageActionList = () => {
    const { message } = useMessageContext('CustomMessageActionList');
    const { t } = useTranslationContext('CustomMessageActionList');
    const deleteHandler = useDeleteHandler(message)
    // const editHandler = useEditHandler(message)
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

        <button
          className='str-chat__message-actions-list-item str-chat__message-actions-list-item-button'
          onClick={() => handleEdit(message)}
        >
          {t('Edit')}
        </button>

        {/** ...other action buttons... */}
      </>
    );
  };


  const getMessageActions = () => {
    return ["flag", "mute", "pin", "react", "reply"];

  };


  const CustomSearchHOC = () => {
    return <CustomSearch setIsSearchQuery={setIsSearchQuery} />
  }


  const WrappedChannel = ({ children }) => {
    return <Channel EmojiPicker={EmojiPicker} CustomMessageActionsList={CustomMessageActionList}>{children}</Channel>;
};
  
  return (
    <BrowserRouter>
      <Chat client={chatClient}>
        <Window>
          <ChannelList filters={filters} sort={sort} showChannelSearch ChannelSearch={CustomSearchHOC} />
        </Window>
        <WrappedChannel>
          <Window>
            <CustomChannelHeader client={chatClient} />
            <MessageList messageActions={getMessageActions()} />
            <MessageInput focus inputRef={inputRef}
              message={editingMessage}
              clearEditingState={() => setEditingMessage(null)} />
          </Window>
          <Thread />
        </WrappedChannel>
      </Chat>
    </BrowserRouter>
  );
};

export default App;
