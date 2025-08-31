# Define source and destination folders
TYPE_SRC := types
RENDERER_DST := src/renderer/src/types
ELECTRON_DST := electron/types

# Target to copy type files
copy-types:
	@echo "Copying type files to $(RENDERER_DST) and $(ELECTRON_DST)..."
	@mkdir -p $(RENDERER_DST)
	@mkdir -p $(ELECTRON_DST)
	@cp -r $(TYPE_SRC)/* $(RENDERER_DST)/
	@cp -r $(TYPE_SRC)/* $(ELECTRON_DST)/
	@echo "Done!"

