BUILD_FLAGS = -o build/index.js

include node_modules/@mathieudutour/js-fatigue/Makefile

clean:
	echo "  $(P) Cleaning"
	rm -rf build/
	mkdir build/

less:
	echo "  $(P) Compiling Less"
	$(BIN_DIR)/lessc src/styles/index.less build/style.css
