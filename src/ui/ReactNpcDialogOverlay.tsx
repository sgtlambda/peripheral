import React, {CSSProperties} from "react";
import {SceneUiNpcInfo, useNpcs} from "./sceneHooks";
import {NpcInteractionLog} from "../logic/NpcInteractionLog";

export const ChatBubble: CSSProperties = {
  background:   'white',
  borderRadius: 3,
  padding:      '8px 10px',
  marginBottom: 10,
  fontFamily:   'Arial',
  fontSize:     13,
};

export const ChatTitle: CSSProperties = {
  // background:   'white',
  textAlign:    'center',
  color:        'white',
  fontWeight:   'bold',
  borderRadius: 3,
  padding:      '8px 10px',
  marginBottom: 10,
  fontFamily:   'Arial',
  fontSize:     13,
};

export const OwnChatBubble: CSSProperties = {
  textAlign:  'right',
  background: '#3bb0d5',
}

export const NpcChatLog: React.FC<{
  npc: SceneUiNpcInfo;
}> = ({npc}) => {
  return <div
    style={{
      left:      npc.x - 150,
      width:     300,
      top:       npc.y - 30,
      transform: 'translateY(-100%)',
      position:  "absolute",
      opacity:   npc.proximity,
      filter:    `blur(${5 - npc.proximity * 5}px)`,
    }}
  >
    <div style={ChatTitle}>{npc.npc.name}</div>
    {npc.npc.interactionLog.results.map((message, i) => {
      const isOwn = message.prefix === NpcInteractionLog.PlayerPrefix;
      return (
        <div key={i} style={{
          ...ChatBubble,
          ...(isOwn ? OwnChatBubble : {}),
        }}>{message.text}</div>
      );
    })}
  </div>;
};

export const ReactNpcDialogOverlay: React.FC = ({}) => {

  const npcs = useNpcs();

  return <>
    {Object.entries(npcs).map(([i, npc]) => (
      <NpcChatLog npc={npc} key={npc.npc.id}/>
    ))}
  </>;
};