import { useState } from 'react'
import { ROUTES } from '../constants'
import { useMessagesPage } from '../hooks/useMessagesPage'
import {
  ConversationSidebar,
  MessageThread,
  ConversationRightSidebar,
  ImageViewerModal,
  ReactionDetailModal,
  DeleteAllConfirmModal,
  DisbandGroupConfirmModal,
  LeaveGroupConfirmModal,
  CreateGroupModal,
  GroupSettingsModal,
  AddMembersToGroupModal,
  ForwardMessageModal,
} from '../components/messages'
import { ReportContentModal } from '../components/ui/common/ReportContentModal'

export function MessagesPage() {
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const api = useMessagesPage()
  const {
    t,
    navigate,
    selectedId,
    selected,
    tab,
    setTab,
    searchConversations,
    setSearchConversations,
    filteredConversations,
    conversationsLoading,
    displayLastMessage,
    friendsSearchResult,
    friendsSearchLoading,
    handleSelectFriendToChat,
    messages,
    messagesLoading,
    messagesEndRef,
    messagesScrollRef,
    openMessageMenuId,
    setOpenMessageMenuId,
    openReactionPickerId,
    setOpenReactionPickerId,
    messageMenuRef,
    openImageViewer,
    closeImageViewer,
    downloadAttachment,
    handleMessageAction,
    handleReaction,
    openReactionDetailMessageId,
    setOpenReactionDetailMessageId,
    selectedReactionEmojiInModal,
    setSelectedReactionEmojiInModal,
    showNewMessageBanner,
    setShowNewMessageBanner,
    reactionNotification,
    setReactionNotification,
    scrollToMessage,
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
    handleDeleteAllMessagesForMe,
    showDisbandConfirm,
    setShowDisbandConfirm,
    handleDisbandGroup,
    showLeaveConfirm,
    setShowLeaveConfirm,
    handleLeaveGroup,
    handleUploadGroupAvatar,
    handleSaveGroupName,
    user,
    withUserLoading,
    withUserId,
    imageViewer,
    openSettingsMenu,
    setOpenSettingsMenu,
    headerActionPanel,
    setHeaderActionPanel,
    hasMoreOlderMessages,
    loadMoreMessagesLoading,
    loadMoreOlderMessages,
    getSettingsUntil,
    getDisappearingDurationSeconds,
    applyConversationSettings,
    rightBarMedia,
    rightBarFiles,
    rightBarLinks,
    rightBarMediaVisible,
    rightBarFilesVisible,
    rightBarLinksVisible,
    loadMoreMedia,
    loadMoreFiles,
    loadMoreLinks,
    setRightBarMediaVisibleCount,
    setRightBarFilesVisibleCount,
    setRightBarLinksVisibleCount,
    rightBarSearchQuery,
    setRightBarSearchQuery,
    rightBarSearchResults,
    rightBarSearchInputRef,
    panelSearchQuery,
    setPanelSearchQuery,
    panelSearchResults,
    showCreateGroupModal,
    setShowCreateGroupModal,
    handleCreateGroupSuccess,
    loadConversations,
    forwardMessage,
    setForwardMessage,
    handleForwardMessage,
    forwardingToId,
    conversations,
    reportModal,
    closeReportModal,
    handleAnyReport,
    submitReportModal,
  } = api

  const composerProps = {
    t,
    inputText: api.inputText,
    setInputText: api.setInputText,
    selectedFiles: api.selectedFiles,
    setSelectedFiles: api.setSelectedFiles,
    sendLoading: api.sendLoading,
    handleSend: api.handleSend,
    handleKeyDown: api.handleKeyDown,
    textareaRef: api.textareaRef,
    fileInputRef: api.fileInputRef,
    imageInputRef: api.imageInputRef,
    videoInputRef: api.videoInputRef,
    addFilesToSend: api.addFilesToSend,
    showEmojiPicker: api.showEmojiPicker,
    setShowEmojiPicker: api.setShowEmojiPicker,
    emojiCategoryId: api.emojiCategoryId,
    setEmojiCategoryId: api.setEmojiCategoryId,
    emojiCategories: api.emojiCategories,
    currentEmojis: api.currentEmojis,
    insertEmoji: api.insertEmoji,
    emojiPickerRef: api.emojiPickerRef,
    showGifPicker: api.showGifPicker,
    setShowGifPicker: api.setShowGifPicker,
    gifPickerRef: api.gifPickerRef,
    gifQuery: api.gifQuery,
    setGifQuery: api.setGifQuery,
    gifResults: api.gifResults,
    gifLoading: api.gifLoading,
    hasGiphyKey: api.hasGiphyKey,
    searchGiphy: api.searchGiphy,
    sendGif: api.sendGif,
    selectedId,
    editingMessage: api.editingMessage,
    cancelEditMessage: api.cancelEditMessage,
    onRemoveEditingAttachment: api.onRemoveEditingAttachment,
  }

  return (
    <main className="flex overflow-hidden max-w-[1600px] mx-auto w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      <ConversationSidebar
        t={t}
        navigate={navigate}
        selectedId={selectedId}
        tab={tab}
        setTab={setTab}
        searchConversations={searchConversations}
        setSearchConversations={setSearchConversations}
        filteredConversations={filteredConversations}
        conversationsLoading={conversationsLoading}
        displayLastMessage={displayLastMessage}
        friendsSearchResult={friendsSearchResult}
        friendsSearchLoading={friendsSearchLoading}
        onSelectFriendToChat={handleSelectFriendToChat}
        onCreateGroup={() => setShowCreateGroupModal(true)}
        onViewProfile={(conv) => conv?.otherUserId && navigate(ROUTES.PROFILE_USER(conv.otherUserId))}
        onOpenMute={(conv) => { navigate(ROUTES.MESSAGES_CONVERSATION(conv.id)); setHeaderActionPanel('mute') }}
        onOpenDisappearing={(conv) => { navigate(ROUTES.MESSAGES_CONVERSATION(conv.id)); setHeaderActionPanel('disappearing') }}
        onDeleteMessages={(conv) => { navigate(ROUTES.MESSAGES_CONVERSATION(conv.id)); setShowDeleteAllConfirm(true) }}
        onBlock={(conv) => conv?.otherUserId && api.handleBlockDirect(conv.otherUserId)}
        onReport={handleAnyReport}
        onLeaveGroup={(conv) => { navigate(ROUTES.MESSAGES_CONVERSATION(conv.id)); setShowLeaveConfirm(true) }}
      />

      <section className="flex-1 flex flex-col min-h-0 min-w-0 bg-background-dark relative w-full">
        {withUserLoading && withUserId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <span className="ml-3">{t('messages.loadingConversation')}</span>
          </div>
        ) : selected ? (
          <div className="w-full flex-1 flex flex-col min-h-0 min-w-0">
            {/* Input file ẩn đặt ở page để ref luôn gắn đúng khi có conversation */}
            <input
              ref={api.fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm,audio/*,.mp3,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              className="hidden"
              onChange={(e) => {
                api.addFilesToSend(e.target.files ? [...e.target.files] : [])
                e.target.value = ''
              }}
            />
            <input
              ref={api.imageInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                api.addFilesToSend(e.target.files ? [...e.target.files] : [])
                e.target.value = ''
              }}
            />
            <input
              ref={api.videoInputRef}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                api.addFilesToSend(e.target.files ? [...e.target.files] : [])
                e.target.value = ''
              }}
            />
            <MessageThread
            t={t}
            selected={selected}
            messages={messages}
            currentUserId={api.currentUserId}
            messagesLoading={messagesLoading}
            messagesScrollRef={messagesScrollRef}
            messagesEndRef={messagesEndRef}
            openMessageMenuId={openMessageMenuId}
            setOpenMessageMenuId={setOpenMessageMenuId}
            openReactionPickerId={openReactionPickerId}
            setOpenReactionPickerId={setOpenReactionPickerId}
            messageMenuRef={messageMenuRef}
            openImageViewer={openImageViewer}
            downloadAttachment={downloadAttachment}
            handleMessageAction={handleMessageAction}
            handleReaction={handleReaction}
            openReactionDetailMessageId={openReactionDetailMessageId}
            setOpenReactionDetailMessageId={setOpenReactionDetailMessageId}
            setSelectedReactionEmojiInModal={setSelectedReactionEmojiInModal}
            showNewMessageBanner={showNewMessageBanner}
            setShowNewMessageBanner={setShowNewMessageBanner}
            reactionNotification={reactionNotification}
            setReactionNotification={setReactionNotification}
            scrollToMessage={scrollToMessage}
            onViewProfile={() => selected?.otherUserId && navigate(ROUTES.PROFILE_USER(selected.otherUserId))}
            onSearchMessages={() => setHeaderActionPanel('search')}
            onOpenMute={() => setHeaderActionPanel('mute')}
            onOpenDisappearing={() => setHeaderActionPanel('disappearing')}
            onDeleteAll={() => setShowDeleteAllConfirm(true)}
            onBlock={() => selected?.otherUserId && api.handleBlockDirect(selected.otherUserId)}
            onUnblock={api.handleUnblockDirect}
            onReport={handleAnyReport}
            headerActionPanel={headerActionPanel}
            setHeaderActionPanel={setHeaderActionPanel}
            panelSearchQuery={panelSearchQuery}
            setPanelSearchQuery={setPanelSearchQuery}
            panelSearchResults={panelSearchResults}
            getSettingsUntil={getSettingsUntil}
            getDisappearingDurationSeconds={getDisappearingDurationSeconds}
            applyConversationSettings={applyConversationSettings}
            hasMoreOlderMessages={hasMoreOlderMessages}
            loadMoreMessagesLoading={loadMoreMessagesLoading}
            onLoadMoreOlderMessages={loadMoreOlderMessages}
            composerProps={composerProps}
            onUploadGroupAvatar={handleUploadGroupAvatar}
            onSaveGroupName={handleSaveGroupName}
          />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">chat_bubble</span>
            <h3 className="text-lg font-semibold text-white mb-2">{t('messages.chooseConversation')}</h3>
            <p className="text-sm max-w-sm">{t('messages.chooseConversationHint')}</p>
          </div>
        )}
      </section>

      {selected && (
        <ConversationRightSidebar
          t={t}
          selected={selected}
          openSettingsMenu={openSettingsMenu}
          setOpenSettingsMenu={setOpenSettingsMenu}
          getSettingsUntil={getSettingsUntil}
          getDisappearingDurationSeconds={getDisappearingDurationSeconds}
          applyConversationSettings={applyConversationSettings}
          setShowDeleteAllConfirm={setShowDeleteAllConfirm}
          rightBarSearchQuery={api.rightBarSearchQuery}
          setRightBarSearchQuery={api.setRightBarSearchQuery}
          rightBarSearchResults={api.rightBarSearchResults}
          rightBarMedia={rightBarMedia}
          rightBarFiles={rightBarFiles}
          rightBarLinks={rightBarLinks}
          rightBarMediaVisible={rightBarMediaVisible}
          rightBarFilesVisible={rightBarFilesVisible}
          rightBarLinksVisible={rightBarLinksVisible}
          loadMoreMedia={loadMoreMedia}
          loadMoreFiles={loadMoreFiles}
          loadMoreLinks={loadMoreLinks}
          setRightBarMediaVisibleCount={setRightBarMediaVisibleCount}
          setRightBarFilesVisibleCount={setRightBarFilesVisibleCount}
          setRightBarLinksVisibleCount={setRightBarLinksVisibleCount}
          openImageViewer={openImageViewer}
          scrollToMessage={scrollToMessage}
          downloadAttachment={downloadAttachment}
          rightBarSearchInputRef={rightBarSearchInputRef}
          onBlock={() => selected?.otherUserId && api.handleBlockDirect(selected.otherUserId)}
          onReport={handleAnyReport}
          onOpenGroupSettings={() => setShowGroupSettingsModal(true)}
          onUploadGroupAvatar={handleUploadGroupAvatar}
          onSaveGroupName={handleSaveGroupName}
          onAddMembers={() => setShowAddMembersModal(true)}
          onDisbandGroup={() => setShowDisbandConfirm(true)}
          onLeaveGroup={() => setShowLeaveConfirm(true)}
          currentUserId={api.currentUserId}
          onSetMemberAdmin={api.handleSetMemberAdmin}
          onMessageUser={api.handleMessageUser}
          onKickMember={api.handleKickMember}
          onBlockUserInChat={(userId) => api.handleBlockDirect(userId)}
        />
      )}

      <ImageViewerModal imageViewer={imageViewer} onClose={closeImageViewer} />

      <ReactionDetailModal
        t={t}
        messageId={openReactionDetailMessageId}
        messages={messages}
        currentUserId={api.currentUserId}
        user={user}
        selected={selected}
        selectedReactionEmojiInModal={selectedReactionEmojiInModal}
        setSelectedReactionEmojiInModal={setSelectedReactionEmojiInModal}
        onClose={() => {
          setOpenReactionDetailMessageId(null)
          setSelectedReactionEmojiInModal(null)
        }}
      />

      <DeleteAllConfirmModal
        t={t}
        open={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleDeleteAllMessagesForMe}
      />
      <DisbandGroupConfirmModal
        t={t}
        open={showDisbandConfirm}
        onClose={() => setShowDisbandConfirm(false)}
        onConfirm={handleDisbandGroup}
      />
      <LeaveGroupConfirmModal
        t={t}
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeaveGroup}
      />
      <CreateGroupModal
        t={t}
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSuccess={handleCreateGroupSuccess}
      />
      <GroupSettingsModal
        t={t}
        open={showGroupSettingsModal}
        onClose={() => setShowGroupSettingsModal(false)}
        selected={selected?.isGroup ? selected : null}
        currentUserId={api.currentUserId}
        onSuccess={(data) => {
          if (selected?.id && data) api.updateConversationData(selected.id, data)
          loadConversations()
        }}
      />
      <AddMembersToGroupModal
        t={t}
        open={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        selected={selected?.isGroup ? selected : null}
        currentUserId={api.currentUserId}
        onSuccess={() => loadConversations()}
      />
      <ForwardMessageModal
        t={t}
        open={!!forwardMessage}
        onClose={() => setForwardMessage(null)}
        message={forwardMessage}
        currentConversationId={selectedId}
        onForward={handleForwardMessage}
        forwarding={forwardingToId}
      />
      <ReportContentModal
        open={reportModal.open}
        titleKey={reportModal.titleKey}
        onClose={closeReportModal}
        onSubmit={submitReportModal}
      />
    </main>
  )
}
