import mitt from 'mitt';

export type Events = {
    emitWord: (word: string, took: number) => void;
     activity: () => void;
    over: () => void;
};

// TODO should this be a singleton as such or maybe use a context or sth similar?
export const emitter = mitt<Events>();