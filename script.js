const areaSelector = new AreaSelector({
  element: document.querySelector('#grid'),
  selectableTargetSelector: '.item',
  datasetKeyForSelection: 'id',
  onSelectionChange: (selectedIds) => {
    console.log('selectedIds', selectedIds);
  }
})