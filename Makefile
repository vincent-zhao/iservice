JSCOVERAGE = ./node_modules/visionmedia-jscoverage/jscoverage

test:
	@npm install
	@./node_modules/mocha/bin/mocha --reporter spec --timeout 2000 test/unit/*.js

cov:
	@npm install
	-mv app app.bak && $(JSCOVERAGE) app.bak app 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 2000 --ignore-leaks test/unit/*.js > ./coverage.html
	-rm -rf app && mv app.bak app

.PHONY: test
