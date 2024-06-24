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
    MessageInputProps,
} from "stream-chat-react";
import { JwtDecodeOptions, jwtDecode } from "jwt-decode";
import "./styles/CustomMessage.css";
import { BrowserRouter } from "react-router-dom";
import CustomSearch from "./components/CustomSearch";
import { EmojiPicker } from 'stream-chat-react/emojis';


import "stream-chat-react/dist/css/index.css";
import CustomChannelHeader from "./components/CustomHeader";

interface JWTDecode extends JwtDecodeOptions {
    user_id: ''
}

interface filtersType {
    type: string;
    members: { $in: any };
    limit?: number;
}



const sort = { last_message_at: -1 };

const App:React.FC = ():React.JSX.Element => {
    const token = localStorage.getItem("token");
    const [filters, setFilters] = useState<filtersType>({ type: "messaging", members: { $in: [jwtDecode<JWTDecode>(token as string).user_id] } })
    const [chatClient, setChatClient]: any = useState(null);
    // const [isSearchQuery, setIsSearchQuery] = useState(false)
    const [editingMessage, setEditingMessage] = useState(null); // Track the message being edited
  const inputRef = useRef<HTMLInputElement | null>(null); // Define inputRef with HTMLInputElement type

    useEffect(() => {
        const initChat = async () => {
            const client: any = StreamChat.getInstance("wfduxrtvehe2", { timeout: 6000 });
            await client.connectUser(
                {
                    id: jwtDecode<JWTDecode>(token as string).user_id,
                    name: jwtDecode<JWTDecode>(token as string).user_id,
                    image:
                        "https://getstream.io/random_png/?id=little-wood-9&name=little-wood-9"
                },
                token
            );
            setChatClient(client);
        };

        initChat();
    }, [token]);

    // useEffect(() => {
    //     if (isSearchQuery) {
    //         setFilters({ type: "messaging", members: { $in: [jwtDecode<JWTDecode>(token as string).user_id] }, limit: 0 })
    //     }

    // }, [isSearchQuery, token])

    if (!chatClient) {
        return <LoadingIndicator />;
    }


    const handleEdit = (message: any) => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setEditingMessage(message);
    };



    const CustomMessageActionList: React.FC = (): JSX.Element | null => {
        const { message }: any = useMessageContext('CustomMessageActionList');
        const { t } = useTranslationContext('CustomMessageActionList');
        const deleteHandler: any = useDeleteHandler(message)
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
                    <>
                        {t('Delete')}
                    </>
                </button>

                <button
                    className='str-chat__message-actions-list-item str-chat__message-actions-list-item-button'
                    onClick={() => handleEdit(message)}
                >
                    <>
                        {t('Edit')}
                    </>
                </button>

                {/** ...other action buttons... */}
            </>
        );
    };


    const getMessageActions = () => {
        return ["flag", "mute", "pin", "react", "reply"];
    };


    const CustomSearchHOC: React.FC = (): React.JSX.Element => {
        return <CustomSearch />
    }


    const WrappedChannel = ({ children }:any) => {
        return <Channel EmojiPicker={EmojiPicker} CustomMessageActionsList={CustomMessageActionList}>{children}</Channel>;
    };

    return (
        <BrowserRouter>
            <Chat client={chatClient}>
                <Window>
                    <ChannelList filters={filters as any} sort={sort as any} showChannelSearch ChannelSearch={CustomSearchHOC} />
                </Window>
                <WrappedChannel>
                    <Window>
                        <CustomChannelHeader client={chatClient as any} />
                        <MessageList messageActions={getMessageActions()} />
                        {/*  @ts-ignore:next-line  */}
                        <MessageInput focus inputRef={inputRef }
                            message={editingMessage as any}
                            clearEditingState={() => setEditingMessage(null)} />
                    </Window>
                    <Thread />
                </WrappedChannel>
            </Chat>
        </BrowserRouter>
    );
};

export default App;
