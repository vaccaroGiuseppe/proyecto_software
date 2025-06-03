"use client";




interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl: string;
  editIconUrl: string;
}

export function UserProfile({ name, email, avatarUrl, editIconUrl }: UserProfileProps) {
  return (
    <header className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-content">
          <img
            src={avatarUrl}
            alt={`${name} profile picture`}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h1 className="profile-name">
              {name}
            </h1>
            <p className="profile-email">
              {email}
            </p>
          </div>
          <button
            className="edit-profile-button"
            aria-label="Edit profile picture"
          >
            <img
              src={editIconUrl}
              alt=""
              className="edit-icon"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
