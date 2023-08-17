CS193X Final Project
====================

Project Title: Bucket List Buddies
Your Name: Tracy Wei

Overview
--------
Bucket List Buddies is a social web app that connects users based on their bucket list goals. Users can share and discover inspiring ideas, add goals to their own bucket lists, and connect with like-minded, spirited individuals to form friendships through the buddies group for each bucket list goal. 

Running
-------
To run the project, you need to `npm install` and `npm start`.
Do we need to load data from init_db.mongodb? Yes.

Features
--------
- Post and share your bucket list goals: Users can make posts for their bucket list goals. Any posts they make are directly added to their own bucket list.
- Add goals from other ssers: Users can add bucket list goals in the 'Other Posts' section from other users to their bucket lists.
- Connect with your bucket list buddies: Once the user has added an item to their bucket list goal, they are added to that item's bucket buddies group and can now connect with their bucket list buddies through its group chat, found by clicking the message icon. (Note: This group chat feature is not fully implemented and appears only as an alert showing the people in the group and bucket list goal.)
- Complete your bucket list goals together: After completing the goal, any of the users in the group can check it off, removing it from everyone's lists.
- User Profiles: Users have profiles with an id, phone number, name, and avatar.
- Login/create accounts: Users can log in with their id and phone number. New users can create accounts by writing in an id and phone number.

