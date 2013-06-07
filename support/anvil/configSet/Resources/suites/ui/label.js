/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

// Simple automated tests of Ti.UI.Label.

module.exports = new function() {
	var finish,
		valueOf;

	this.init = function(testUtils) {
		finish = testUtils.finish;
		valueOf = testUtils.valueOf;
	}

	this.name = "label";
	this.tests = [
		{name: "testProperties"},
		{name: "testTextId"},
		{name: "testElipsize"},
		{name: "testWordWrap"},
		{name: "testVerticalAlign"},
		{name: "testAutolink"}
	];

	// Verifies if the methods and properties of Ti.UI.Label have the correct type and are sane.
	this.testProperties = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white',
				exitOnClose: true,
				fullscreen: false,
				layout: 'vertical',
				title: 'Label Demo'
			}),
			label1 = Ti.UI.createLabel({
				color: '#900',
				font: { fontSize:48 },
				shadowColor: '#aaa',
				shadowOffset: {x: 5, y: 5},
				text: 'A simple label',
				textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
				top: 30,
				width: 'auto', 
				height: 'auto'
			});

		win.add(label1);

		valueOf(testRun, label1.color).shouldBe('#900');
		valueOf(testRun, label1.shadowColor).shouldBe('#aaa');
		valueOf(testRun, label1.top).shouldBe(30);
		valueOf(testRun, label1.textAlign).shouldBe(Ti.UI.TEXT_ALIGNMENT_CENTER);
		valueOf(testRun, label1.text).shouldBe('A simple label');
		valueOf(testRun, label1.font).shouldBeObject();
		valueOf(testRun, label1.font.fontSize).shouldBe('48px');

		win.addEventListener('open', function() {
			win.close();
			finish(testRun);
		});

		win.open();
	}

	// Verifies the operation of linkification.
	this.testAutolink = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white',
				exitOnClose: true,
				layout: 'vertical'
			}),
			label1 = Ti.UI.createLabel({
				color: '#900',
				font: { fontSize:14 },
				text: 'test@test.com\n 817-555-5555\n http://bit.ly',
				top: 30,
				width: 'auto',
				height: 'auto',
				autoLink: Ti.UI.AUTOLINK_NONE
			});

		win.add(label1);

		// When everything loads, begin the test
		win.addEventListener('postlayout', checkAutolinkBefore);

		win.open();

		// To make sure the starting conditions are right, check that our label with 
		// flag AUTOLINK_NONE has no links inside.
		function checkAutolinkBefore(){
			var anchors = label1.domNode.getElementsByTagName('a');
			valueOf(testRun, anchors.length).shouldBe(0);

			label1.autoLink = Ti.UI.AUTOLINK_ALL;
			checkAutolinkAfter();
		}

		function checkAutolinkAfter() {
			valueOf(testRun, label1.autoLink).shouldBe(Ti.UI.AUTOLINK_ALL);

			// There should now be 3 links ("a" tags).
			var label = label1.domNode,
				anchors = label.getElementsByTagName('a');

			valueOf(testRun, anchors.length).shouldBe(3);
			if (anchors.length >= 3){
				var emailAnchor = anchors[0],
					phoneAnchor = anchors[1],
					urlAnchor   = anchors[2];

				// Check if the text of the links is right.
				// (We don't check the target of the links, because this is implementation
				// detail and depends on internal Tizen service IDs and similar things.)
				valueOf(testRun, emailAnchor.innerHTML).shouldBe("test@test.com");
				valueOf(testRun, phoneAnchor.innerHTML).shouldBe("817-555-5555");
				valueOf(testRun, urlAnchor.innerHTML).shouldBe("http://bit.ly");
			}

			win.close();
			finish(testRun);
		}
	}

	// Verify the label is created and displayed correctly, by analyzing the HTML code it
	// generates for itself.
	this.testTextId = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white'
			}),
			test_text = 'this is label text',
			file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'test.txt');

		file.write(test_text);

		var label1 = Ti.UI.createLabel({
			textid: file.nativePath,
			top: 30,
			width: 'auto', height: 'auto'
		});
				
		label1.addEventListener('postlayout', checkText);

		win.add(label1);
		win.addEventListener('close', function() {
			finish(testRun);
		})

		win.open();

		function checkText(){
			var dom_node = label1.domNode,
				text_view = dom_node.getElementsByClassName('TiUIView')[0],
				text = text_view.innerHTML;

			valueOf(testRun, text).shouldBe(test_text);
		}
	}

	// Verify the label is ellpsized, by analyzing the CSS style it generates for itself.
	this.testElipsize = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white'
			}),
			label1 = Ti.UI.createLabel({
				text: 'very very long text',
				top: 30,
				ellipsize: true,
				width: '60', height: 'auto'
			});
				
		label1.addEventListener('postlayout', checkLabel);

		win.add(label1);
		win.addEventListener('close', function() {
			finish(testRun);
		})

		win.open();

		function checkLabel() {
			var dom_node = label1.domNode,
				text_view = dom_node.getElementsByClassName('TiUIView')[0];

			valueOf(testRun, text_view.style.textOverflow).shouldBe('ellipsis');

			win.close();
		}
	}

	// Verify the label's word wrap is disabled (default is enabled), by analyzing the CSS style 
	// the label generates for itself.
	this.testWordWrap = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white'
			}),
			label1 = Ti.UI.createLabel({
				text: 'very very long text',
				top: 30,
				wordWrap: false,
				width: '60', height: 'auto'
			});
				
		label1.addEventListener('postlayout', checkLabel);

		win.add(label1);
		win.addEventListener('close', function() {
			finish(testRun);
		})

		win.open();

		function checkLabel() {
			var dom_node = label1.domNode,
				text_view = dom_node.getElementsByClassName('TiUIView')[0];

			valueOf(testRun, text_view.style.whiteSpace).shouldBe('nowrap');

			win.close();
		}
	}

	// Verify the operation of alignment, by checking the resulting relative coordinates
	// of the labels (the geometric properties of the coordinates must correspond
	// to the current alignment mode).
	this.testVerticalAlign = function(testRun) {
		var win = Ti.UI.createWindow({
				backgroundColor: 'white',
				layout: 'vertical'
			}),
			label1 = Ti.UI.createLabel({
				top: 10,
				width: 160,
				height: 50,
				backgroundColor: '#ff55ff',
				verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
				text: 'some text'
			}),
			label2 = Ti.UI.createLabel({
				top: 10,
				width: 160,
				height: 50,
				backgroundColor: '#ff55ff',
				verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				text: 'some text'
			}),
			label3 = Ti.UI.createLabel({
				top: 10,
				width: 160,
				height: 50,
				backgroundColor: '#ff55ff',
				verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
				text: 'some text'
			});

		label1.addEventListener('postlayout', function() {
			checkLabel(label1, checkAlignBottom);
		});

		label1.addEventListener('postlayout', function() {
			checkLabel(label2, checkAlignCenter);
		});

		label1.addEventListener('postlayout', function() {
			checkLabel(label3, checkAlignTop);
		});

		win.add(label1);
		win.add(label2);
		win.add(label3);
		win.open();

		win.addEventListener('close', function() {
			finish(testRun);
		})

		function checkAlignBottom(view_top, view_bottom) {
			valueOf(testRun, view_top).shouldBeGreaterThan(view_bottom);
		}

		function checkAlignCenter(view_top, view_bottom) {
			valueOf(testRun, Math.abs(view_top - view_bottom)).shouldBeLessThanEqual(1);
		}

		function checkAlignTop(view_top, view_bottom) {
			valueOf(testRun, view_top).shouldBeLessThan(view_bottom);

			win.close()
		}

		function checkLabel(testLabel, callback){
			var dom_node = testLabel.domNode,
				text_view = dom_node.getElementsByClassName('TiUIView')[0],
				view_top = text_view.style.top,
				v_height,
				view_bottom;

			view_top = view_top.slice(0, -2);
			v_height = text_view.style.height;
			v_height = v_height.slice(0, -2);
			view_bottom = testLabel.height - view_top - v_height;

			callback(view_top, view_bottom);
		}
	}
}