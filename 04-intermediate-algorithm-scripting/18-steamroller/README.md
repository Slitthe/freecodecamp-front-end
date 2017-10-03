# <a href="https://www.freecodecamp.org/challenges/steamroller">Task Details</a> 

Flatten a nested array. You must account for varying levels of nesting.


<h3><b>Note:</b></h3>

This will flatten multi-dimensional arrays and keep their value in order.

For example this will turn something like this:
```javascript
console.log(steamrollArray(
	[	1,
		2,
		[
			[3, [[4]] ],
			[[5]]
		],
		[
			[
				6,
				[[[7, [8] ]]],
				9
			],
			10
		],
		[[11]]
	]
));
```

into

```javascript
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
```	
