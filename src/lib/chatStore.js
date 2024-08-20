import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isCurrentReceiverBlocked: false,
    changeChat: async (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;

        if (!currentUser || !user) {
            console.error('Current user or chat user is not defined');
            return;
        }

        const isUserBlocked = user.blocked?.includes(currentUser.id) || false;
        const isCurrentUserBlocked = currentUser.blocked?.includes(user.id) || false;

        set({
            chatId,
            user: isUserBlocked ? null : user,
            isCurrentUserBlocked,
            isCurrentReceiverBlocked: isCurrentUserBlocked,
        });
    },
    changeBlock: () => {
        set((state) => ({
            ...state,
            isCurrentReceiverBlocked: !state.isCurrentReceiverBlocked
        }));
    }
}));
