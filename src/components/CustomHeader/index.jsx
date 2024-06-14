import React from 'react'
import { useChannelStateContext, useChatContext } from 'stream-chat-react';

const CustomChannelHeader = (props) => {
    const { client } = props;
    const { channel } = useChannelStateContext();
    let ChannelName = {}

    //TODO Add static logic for idenify receiver
    const memberList = channel.state.members;
    Object.entries(memberList).forEach(([key, val]) => {
        // console.log(key,val ,client)
        if (val.user_id !== client.userID) {
            ChannelName = val
        }
    })
    console.log("watchers", client, channel.state.members, ChannelName)



    return (
        <div className='str-chat__header-livestream'>
            <div>
                <div className='header-item'>
                    <img src={ChannelName?.user?.image} className='header-item__image' alt='User profile' />
                    <div className='header-item__title-wrapper'>
                        <p className='header-item__channel-name'>{ChannelName?.user?.name}</p>
                        <div className='header-item__user-statatus-wrapper'><div className='header-item__channel-dot' style={ChannelName?.user?.online ? { background: "green" } : { background: "red" }}></div> {ChannelName?.user?.online ? "Online" : "Offline"} </div>
                        {/* <div className='header-item__channel-status'>{ChannelName?.user?.online ? (<><span className='header-item__channel-dot'></span> Online</>) :<> <div className='header-item__channel-dot'></div> Offline </>}</div> */}
                    </div>
                </div>
                {/* <TypingIndicator /> */}
            </div>
        </div>
    );

}

export default CustomChannelHeader
