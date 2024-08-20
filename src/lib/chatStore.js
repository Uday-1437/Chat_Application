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
            console.error('Current user or user is not defined');
            return;
        }

        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isCurrentReceiverBlocked: false,
            });
        }

        if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isCurrentReceiverBlocked: true,
            });
        }

        return set({
            chatId,
            user,
            isCurrentUserBlocked: false,
            isCurrentReceiverBlocked: false,
        });
    },
    changeBlock: () => {
        set((state) => ({
            ...state,
            isCurrentReceiverBlocked: !state.isCurrentReceiverBlocked
        }));
    }
}));
