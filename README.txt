CS193X Final Project
====================

Project Title: Bucket List Buddies
Your Name: Tracy Wei
Your SUNetID: tracywei

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

Collaboration and libraries
---------------------------
My project overlaps with Assignment 3.1 and 3.2, which provided the foundation of this social media app. I used the HTML/CSS from the assignments to get started with my project and changed and added more HTML/CSS to better fit what I wanted to do in the project (ie. changing the posts to look like cards on a board instead of a row per post, making a profile section, adding a login and logout form, etc.). As for the JavaScript frontend, I also used the assignments' as a foundation but built and edited on top of it to adjust to the features I added in my project (ie. bucket list vs. other posts sections, the buddies list, adding/checking off items, messaging, etc.). Lastly, since the assignments' backend was similar to what was needed for my project, I used that but added on more routes that were needed for the features unique to my project (ie. getting buddies list, adding/removing items, etc.).
I did consult external code to create the rainbow animation background in my project. Credits to https://gscode.in/css-animated-backgrounds/ (Animation background #1, Author: Maxim)

Anything else?
-------------
As a web dev beginner, I learned so much from this class!
