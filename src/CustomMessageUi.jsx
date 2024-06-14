import {
    Avatar,
    MessageText,
    ReactionsList,
    useMessageContext,
    useChatContext,
    Channel,
    useComponentContext,
    MessageSimple,
    MessageActionsBox,
    MessageList,
    Message,
} from 'stream-chat-react';
import "./styles/CustomMessage.css"

const customReactionOptions = [
    { name: 'Thumbs up', type: '+1', Component: () => <>👍</> },
    { name: 'Thumbs down', type: '-1', Component: () => <>👎</> },
];

const statusIconMap = {
    received: '✅',
    receivedAndRead: '👁️',
    sending: '🛫',
    unknown: '❓',
};

// const CustomMessageUiActions = () => {
//     const {
//         handleDelete,
//         handleFlag,
//         handleOpenThread,
//         handlePin,
//         handleReaction,
//         message,
//         threadList,
//     } = useMessageContext();

//     const { reactionOptions } = useComponentContext()

//     if (threadList) return null;

//     return (
//         <div className='custom-message-ui__actions'>
//             <div className='custom-message-ui__actions-group'>
//                 {reactionOptions.map(({ Component, name, type }) => (
//                     <button key={type} onClick={(e) => handleReaction(type, e)} title={`React with: ${name}`}>
//                         <Component />
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };


const CustomMessageUiActions = () => {
    const {
        handleDelete,
        handleEdit,
        handleReaction,
        message,
        threadList,
    } = useMessageContext();

    const { client } = useChatContext();
    const { reactionOptions } = useComponentContext();

    const isCurrentUser = message.user.id === client.userID;

    if (threadList) return null;

    return (
        <div className='custom-message-ui__actions'>
            <div className='custom-message-ui__actions-group'>
                {reactionOptions.map(({ Component, name, type }) => (
                    <button key={type} onClick={(e) => handleReaction(type, e)} title={`React with: ${name}`}>
                        <Component />
                    </button>
                ))}
                {isCurrentUser && (
                    <>
                        <button onClick={handleEdit} title="Edit">Edit</button>
                        <button onClick={handleDelete} title="Delete">Delete</button>
                    </>
                )}
            </div>
        </div>
    );
};
const CustomMessageUiMetadata = () => {
    const {
        message: {
            created_at: createdAt,
            message_text_updated_at: messageTextUpdatedAt,
            reply_count: replyCount = 0,
            status = 'unknown',
        },
        readBy = [],
        handleOpenThread,
    } = useMessageContext();
    const { client } = useChatContext();

    const [firstUser] = readBy;

    const receivedAndRead = readBy.length > 1 || (firstUser && firstUser.id !== client.user?.id);

    return (
        <div className='custom-message-ui__metadata'>
            <div className='custom-message-ui__metadata-created-at'>{createdAt?.toLocaleString()}</div>
            <div className='custom-message-ui__metadata-read-status'>
                {receivedAndRead
                    ? statusIconMap.receivedAndRead
                    : statusIconMap[status] ?? statusIconMap.unknown}
            </div>
            {messageTextUpdatedAt && (
                <div className='custom-message-ui__metadata-edited-status' title={messageTextUpdatedAt}>
                    Edited
                </div>
            )}
            {replyCount > 0 && (
                <button className='custom-message-ui__metadata-reply-count' onClick={handleOpenThread}>
                    <span>
                        {replyCount} {replyCount > 1 ? 'replies' : 'reply'}
                    </span>
                </button>
            )}
        </div>
    );
};

const CustomMessageUi = (props) => {
    const { isMyMessage, message, handleDelete,
        handleEdit,
        handleReaction,
        threadList } = useMessageContext();
    const { client } = useChatContext();

    console.log("handleDelete", client)

    const messageUiClassNames = ['custom-message-ui'];

    const isReceiver = message.cid !== client.userID;
    console.log("message", message)

    if (isMyMessage()) {
        messageUiClassNames.push('custom-message-ui--mine');
    } else {
        messageUiClassNames.push('custom-message-ui--other');
    }

    console.log("isReciever", isReceiver, message.text)

    const isCurrentUser = message.cid === client.user.id;


    const messageOptions = ['flag', 'mute', 'pin', 'quote', 'react', 'reply']

    if (isReceiver) {
        messageOptions.push('edit')
        messageOptions.push('delete')
    }
    console.log("messageOptions", messageOptions)
    return (
        // <div className={messageUiClassNames.join(' ')} data-message-id={message.id}>
        //     {message.deleted_at && (
        //         <div className='custom-message-ui__body'>This message has been deleted...</div>
        //     )}
        //     {!message.deleted_at && (
        //         <>
        //             <div className='custom-message-ui__body'>
        //                 <Avatar image={message.user?.image} name={message.user?.name || message.user?.id} />
        //                 <MessageText />
        //             </div>
        //             <CustomMessageUiMetadata />
        //             <CustomMessageUiActions />
        //             {/* <ReactionsList /> */}
        //         </>
        //     )}
        // </div>
        <Message
            // customMessageActions={{
            //     'Copy text': (message) => {
            //         navigator.clipboard.writeText(message.text || '');
            //     },
            //     'Delete text': handleDelete,
            // }}
            // messageActions={messageOptions}
        />
    );
};

export default CustomMessageUi;
