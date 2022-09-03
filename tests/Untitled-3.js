PUT http://localhost:3000/dishes/62c34fc184def89852fdec9f HTTP/1.1
content-type: application/json

{
    "name": "Uthappizza23www6666w",
    "image": "images/uthappizza.png",
    "category": "mains",
    "label": "Hot",
    "price": "4.99",
    "featured": true,
    "description": "A unique combination of Indian Uthappam (pancake) and Italian pizza, topped with Cerignola olives, ripe vine cherry tomatoes, Vidalia onion, Guntur chillies and Buffalo Paneer."
}


###

PUT http://localhost:3000/dishes/62c3574c677b0171f93df56c/comments/62c3574d677b0171f93df56e HTTP/1.1
content-type: application/json

{
    "_id": "62c3574c677b0171f93df56d",
    "ratig": "1",
    "author": "Pipka!",
    "comment": "update2"
}

